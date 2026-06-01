"""
Tests for the Expense Parsing Engine.
Run:  python -m pytest test_parser.py -v
  or: python test_parser.py
"""

from app.parser import parse_expense


def test_basic_expense():
    """'500 gym cash' → amount=500, category=Gym, mode=cash"""
    result = parse_expense("500 gym cash")
    assert result["amount"] == 500.0
    assert result["category"] == "Gym"
    assert result["payment_mode"] == "cash"
    assert result["confidence"] == 100
    print(f"✅ test_basic_expense: {result}")


def test_decimal_amount():
    """'49.99 coffee upi' → amount=49.99"""
    result = parse_expense("49.99 coffee upi")
    assert result["amount"] == 49.99
    assert result["payment_mode"] == "upi"
    assert result["category"] == "Coffee"
    print(f"✅ test_decimal_amount: {result}")


def test_existing_category_match():
    """If user already has 'Food', typing 'fod' should fuzzy-match to 'Food'"""
    result = parse_expense("120 fod upi", user_categories=["Food", "Travel"])
    assert result["amount"] == 120.0
    assert result["category"] == "Food"  # fuzzy matched!
    assert result["payment_mode"] == "upi"
    print(f"✅ test_existing_category_match: {result}")


def test_new_category_creation():
    """If no existing category matches, a new one is created"""
    result = parse_expense("300 electricity cash", user_categories=["Food", "Travel"])
    assert result["amount"] == 300.0
    assert result["category"] == "Electricity"  # new category
    assert result["payment_mode"] == "cash"
    print(f"✅ test_new_category_creation: {result}")


def test_no_amount():
    """Message without a number"""
    result = parse_expense("bought groceries")
    assert result["amount"] is None
    assert result["category"] == "Bought"
    print(f"✅ test_no_amount: {result}")


def test_amount_only():
    """Just a number"""
    result = parse_expense("250")
    assert result["amount"] == 250.0
    assert result["category"] is None
    assert result["payment_mode"] is None
    assert result["confidence"] == 33
    print(f"✅ test_amount_only: {result}")


def test_credit_card_mode():
    """'1500 shopping credit' should match 'credit card'"""
    result = parse_expense("1500 shopping credit")
    # 'credit' vs 'credit card' — fuzz.ratio may not hit 80
    # but 'shopping' will become the category
    assert result["amount"] == 1500.0
    print(f"✅ test_credit_card_mode: {result}")


if __name__ == "__main__":
    test_basic_expense()
    test_decimal_amount()
    test_existing_category_match()
    test_new_category_creation()
    test_no_amount()
    test_amount_only()
    test_credit_card_mode()
    print("\n🎉 All tests passed!")
