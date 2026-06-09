import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TransactionsPage from './components/TransactionsPage'
import ReportsPage from './components/ReportsPage'
import AddExpensePage from './components/AddExpensePage'
import DashboardPreview from './components/DashboardPreview'
import CategoriesPage from './components/CategoriesPage'
import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import CreateAccountPage from './components/CreateAccountPage'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './components/LandingPage'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/add-expense" element={<AddExpensePage />} />
            <Route path="/dashboard-preview" element={<DashboardPreview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
