import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  List,
  Switch,
  notification,
  Radio,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

const { Option } = Select;

const App = () => {
  const [transactions, setTransactions] = useState([]);
  // eslint-disable-next-line
  const [categories, setCategories] = useState([
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Misc',
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: null,
    note: '',
  });
  const [darkMode, setDarkMode] = useState(false);
  const [initialIncome, setInitialIncome] = useState(0);

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const savedIncome = JSON.parse(localStorage.getItem('initialIncome')) || 0;
    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
    setTransactions(savedTransactions);
    setInitialIncome(savedIncome);
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('initialIncome', JSON.stringify(initialIncome));
  }, [initialIncome]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const addTransaction = () => {
    const newTransaction = {
      ...formData,
      amount:
        formData.type === 'expense'
          ? -Math.abs(parseFloat(formData.amount))
          : Math.abs(parseFloat(formData.amount)),
      id: Date.now(),
    };

    setTransactions([...transactions, newTransaction]);
    setModalVisible(false);
    notification.success({ message: 'Transaction added successfully!' });

    // Reset form data
    setFormData({ type: 'expense', amount: '', category: '', date: null, note: '' });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((item) => item.id !== id));
    notification.warning({ message: 'Transaction deleted!' });
  };

  const income = initialIncome + transactions
    .filter((item) => item.amount > 0)
    .reduce((acc, item) => acc + parseFloat(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.amount < 0)
    .reduce((acc, item) => acc + parseFloat(item.amount), 0);

  const categoryData = categories.map((cat) => {
    return {
      name: cat,
      value: transactions
        .filter((item) => item.category === cat)
        .reduce((acc, item) => acc + Math.abs(item.amount), 0),
    };
  });

  const pieData = {
    labels: categoryData.map((cat) => cat.name),
    datasets: [
      {
        data: categoryData.map((cat) => cat.value),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#ff9f40', '#8d6e63'],
      },
    ],
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header>
        <h1>Expense Tracker</h1>
        <Switch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
        />
      </header>

      {/* Initial Income Input */}
      <div className="initial-income-section">
        <Card title="Set Initial Income" style={{ backgroundColor: '#e0f7fa' }}>
          <Input
            placeholder="Enter initial income"
            type="number"
            value={initialIncome}
            onChange={(e) => setInitialIncome(parseFloat(e.target.value) || 0)}
            style={{ width: '100%' }}
          />
        </Card>
      </div>

      <div className="summary">
        <Card title="Total Income" style={{ backgroundColor: '#e0f7fa' }}>
          ₹{income.toFixed(2)}
        </Card>
        <Card title="Total Expenses" style={{ backgroundColor: '#ffebee' }}>
          ₹{Math.abs(expenses).toFixed(2)}
        </Card>
        <Card title="Balance" style={{ backgroundColor: '#e8f5e9' }}>
          ₹{(income + expenses).toFixed(2)}
        </Card>
      </div>

      <div className="charts">
        <Card title="Category Breakdown">
          <div style={{ width: '80%', height: '300px', margin: '0 auto' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
      </div>

      <div className="transaction-section">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Transaction
        </Button>

        <List
          itemLayout="horizontal"
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button onClick={() => deleteTransaction(item.id)}>Delete</Button>,
              ]}
            >
              <List.Item.Meta
                title={`${item.category} - ₹${item.amount}`}
                description={`${item.date || 'No date'} - ${item.note || 'No notes'}`}
              />
            </List.Item>
          )}
        />
      </div>

      {/* Add Transaction Modal */}
      <Modal
        open={modalVisible}
        onOk={addTransaction}
        onCancel={() => setModalVisible(false)}
      >
        {/* Income or Expense Selection */}
        <Radio.Group
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          style={{ marginBottom: 10 }}
        >
          <Radio.Button value="income">Income</Radio.Button>
          <Radio.Button value="expense">Expense</Radio.Button>
        </Radio.Group>

        <Input
          placeholder="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) || '' })
          }
          style={{ marginBottom: 10 }}
        />
        <Select
          placeholder="Category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          style={{ width: '100%', marginBottom: 10 }}
        >
          {categories.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
        <DatePicker
          style={{ width: '100%', marginBottom: 10 }}
          onChange={(date, dateString) =>
            setFormData({ ...formData, date: dateString })
          }
        />
        <Input
          placeholder="Notes"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          style={{ marginBottom: 10 }}
        />
      </Modal>
    </div>
  );
};

export default App;
