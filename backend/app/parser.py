"""
Expense Parsing Engine
======================
Uses Regex for amount extraction and RapidFuzz for fuzzy matching
of payment modes and dynamic user categories.
"""

import re
from typing import Optional
from rapidfuzz import fuzz

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PAYMENT_MODES = [
    "upi",
    "cash",
    "credit card",
    "credit",
    "debit card",
    "debit",
    "net banking",
]

# Currency stop-words — these are stripped after amount extraction
CURRENCY_WORDS = {
    "rs", "rs.", "inr", "rupees", "rupee",
    "$", "usd", "dollars", "dollar",
    "€", "eur", "euros",
    "£", "gbp",
}

# Confidence threshold – lowered to 70 to catch typos like 'foos' vs 'food' (75%)
MATCH_THRESHOLD = 70

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _extract_amount(text: str) -> tuple[Optional[float], str]:
    """
    Extract the first numeric value from the text.
    Returns (amount, remaining_text_without_the_number).
    """
    match = re.search(r"\d+(?:\.\d+)?", text)
    if match:
        amount = float(match.group())
        remaining = text[:match.start()] + text[match.end():]
        return amount, remaining.strip()
    return None, text


def _strip_currency_words(words: list[str]) -> list[str]:
    """
    Remove any currency labels (rs, inr, $, etc.) from the word list
    so they are never mistaken for a category or payment mode.
    """
    return [w for w in words if w.lower() not in CURRENCY_WORDS]


def _detect_payment_mode(words: list[str]) -> tuple[Optional[str], list[str]]:
    """
    Compare each word against PAYMENT_MODES using RapidFuzz.
    Returns (matched_mode, remaining_words).
    """
    best_score = 0
    best_mode: Optional[str] = None
    matched_index: Optional[int] = None

    for i, word in enumerate(words):
        for mode in PAYMENT_MODES:
            score = fuzz.ratio(word.lower(), mode.lower())
            if score > best_score and score >= MATCH_THRESHOLD:
                best_score = score
                best_mode = mode
                matched_index = i

    remaining = [w for i, w in enumerate(words) if i != matched_index]
    return best_mode, remaining


def _detect_category(
    words: list[str],
    user_categories: list[str],
) -> tuple[Optional[str], list[str], bool, Optional[str]]:
    """
    Compare each remaining word against the user's existing categories.
    - If a word scores >= MATCH_THRESHOLD  → use the existing category.
    - If no user categories exist yet       → auto-create from first word.
    - Otherwise                             → return needs_clarification=True
                                              so the webhook can ask the user.

    Returns (category, remaining_words, needs_clarification, raw_word)
    """
    if not words:
        return None, words, False, None

    # --- Try to match against existing user categories ---
    best_score = 0
    best_category: Optional[str] = None
    matched_index: Optional[int] = None

    for i, word in enumerate(words):
        for cat in user_categories:
            score = fuzz.ratio(word.lower(), cat.lower())
            if score > best_score:
                best_score = score
                best_category = cat
                matched_index = i

    # High-confidence fuzzy match → use existing category
    if best_score >= MATCH_THRESHOLD and best_category is not None:
        remaining = [w for i, w in enumerate(words) if i != matched_index]
        return best_category, remaining, False, None

    # No existing categories at all → auto-create silently (first-time user)
    if not user_categories:
        new_category = words[0].capitalize()
        remaining = words[1:]
        return new_category, remaining, False, None

    # Low-confidence match → ask user to clarify
    raw_word = words[0].capitalize()
    remaining = words[1:]
    return None, remaining, True, raw_word


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_expense(text: str, user_categories: list[str] | None = None) -> dict:
    """
    Parse a natural-language expense message into structured data.

    Parameters
    ----------
    text : str
        The raw message from Telegram, e.g. "500 gym cash".
    user_categories : list[str] | None
        Previously-used categories for this user (fetched from the DB).

    Returns
    -------
    dict with keys: amount, category, payment_mode, description, confidence
    """
    if user_categories is None:
        user_categories = []

    # Step 1 – Extract amount
    amount, remaining = _extract_amount(text)

    # Step 2 – Tokenise remaining text
    words = remaining.split()

    # Step 2.5 – Strip currency labels (rs, inr, $, etc.)
    words = _strip_currency_words(words)

    # Step 3 – Detect payment mode
    payment_mode, words = _detect_payment_mode(words)

    # Step 4 – Detect / create category
    category, words, needs_clarification, raw_category_word = _detect_category(
        words, user_categories
    )

    # Step 5 – Whatever is left becomes the description
    description = " ".join(words).strip() or None

    # Step 6 – Confidence scoring
    #   100 = amount + mode + category all detected
    #    66 = two of three detected
    #    33 = one of three detected
    #     0 = nothing detected
    detected = sum([
        amount is not None,
        payment_mode is not None,
        category is not None,
    ])
    confidence = round((detected / 3) * 100)

    return {
        "amount": amount,
        "category": category,
        "payment_mode": payment_mode,
        "description": description,
        "confidence": confidence,
        "needs_clarification": needs_clarification,
        "raw_category_word": raw_category_word,
    }
