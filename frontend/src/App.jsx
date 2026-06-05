import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TransactionsPage from './components/TransactionsPage'
import ReportsPage from './components/ReportsPage'
import AddExpensePage from './components/AddExpensePage'
import DashboardPreview from './components/DashboardPreview'
import CategoriesPage from './components/CategoriesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/add-expense" element={<AddExpensePage />} />
          <Route path="/dashboard-preview" element={<DashboardPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
