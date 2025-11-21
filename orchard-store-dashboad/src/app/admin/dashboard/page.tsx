"use client";

import { Card, Col, Row, Tag, Table, Typography, Space } from "antd";
import {
  Wallet,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import type { ColumnsType } from "antd/es/table";

const statCards = [
  {
    title: "Total Revenue",
    value: "$248.4K",
    change: "+18.4%",
    trend: "up",
    description: "vs last month",
    gradient: "linear-gradient(135deg, #475569, #64748B)",
    icon: Wallet,
  },
  {
    title: "Total Orders",
    value: "3,482",
    change: "+5.4%",
    trend: "up",
    description: "vs last month",
    gradient: "linear-gradient(135deg, #64748B, #94A3B8)",
    icon: ShoppingBag,
  },
  {
    title: "New Customers",
    value: "1,205",
    change: "+2.1%",
    trend: "up",
    description: "vs last month",
    gradient: "linear-gradient(135deg, #334155, #475569)",
    icon: Users,
  },
  {
    title: "Low Stock Alert",
    value: "14 items",
    change: "-3 items",
    trend: "down",
    description: "critical threshold",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    icon: AlertTriangle,
  },
];

const revenueSeries = [
  { label: "Mon", value: 3200 },
  { label: "Tue", value: 4200 },
  { label: "Wed", value: 3800 },
  { label: "Thu", value: 5200 },
  { label: "Fri", value: 6100 },
  { label: "Sat", value: 4500 },
  { label: "Sun", value: 6800 },
];

const topProducts = [
  { name: "Aroma Diffuser", sales: 820 },
  { name: "Citrus Essential Oil", sales: 760 },
  { name: "Soothing Candle Set", sales: 640 },
  { name: "Body Care Kit", sales: 588 },
  { name: "Green Tea Serum", sales: 540 },
];

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

interface RecentOrder {
  key: string;
  orderId: string;
  customerName: string;
  status: OrderStatus;
  total: string;
}

const statusColorMap: Record<OrderStatus, string> = {
  PENDING: "gold",
  CONFIRMED: "blue",
  SHIPPING: "purple",
  COMPLETED: "green",
  CANCELLED: "red",
};

const recentOrders: RecentOrder[] = [
  {
    key: "1",
    orderId: "#ORD-94821",
    customerName: "Jane Cooper",
    status: "SHIPPING",
    total: "$320.00",
  },
  {
    key: "2",
    orderId: "#ORD-94820",
    customerName: "Devon Lane",
    status: "CONFIRMED",
    total: "$145.50",
  },
  {
    key: "3",
    orderId: "#ORD-94819",
    customerName: "Wade Warren",
    status: "PENDING",
    total: "$89.00",
  },
  {
    key: "4",
    orderId: "#ORD-94818",
    customerName: "Cody Fisher",
    status: "COMPLETED",
    total: "$540.10",
  },
  {
    key: "5",
    orderId: "#ORD-94817",
    customerName: "Kristin Watson",
    status: "CANCELLED",
    total: "$120.00",
  },
];

const columns: ColumnsType<RecentOrder> = [
  {
    title: "Order ID",
    dataIndex: "orderId",
    key: "orderId",
    render: (value: string) => (
      <Typography.Text strong>{value}</Typography.Text>
    ),
  },
  {
    title: "Customer",
    dataIndex: "customerName",
    key: "customerName",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: OrderStatus) => (
      <Tag color={statusColorMap[status]}>{status}</Tag>
    ),
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Col xs={24} sm={12} xl={6} key={card.title}>
              <div
                className="rounded-2xl p-5 text-white shadow-xl"
                style={{ background: card.gradient }}
              >
                <div className="flex items-center justify-between">
                  <Icon size={28} className="opacity-80" />
                  <div className="text-right">
                    <p className="text-sm">{card.title}</p>
                    <p className="text-2xl font-semibold">{card.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm opacity-90">
                  <span>{card.description}</span>
                  <Space
                    size={4}
                    align="center"
                    className={
                      card.trend === "up" ? "text-emerald-200" : "text-red-200"
                    }
                  >
                    {card.trend === "up" ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {card.change}
                  </Space>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title="Revenue Over Time"
            className="chart-card"
            extra={
              <Typography.Text type="secondary">Last 7 days</Typography.Text>
            }
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries}>
                  <CartesianGrid vertical={false} stroke="#eef0f4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#475569"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Top Selling Products"
            className="chart-card"
            extra={
              <Typography.Text type="secondary">This week</Typography.Text>
            }
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="sales" radius={[12, 12, 0, 0]} fill="#64748B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Recent Orders"
        className="table-card activity-table"
        extra={<Typography.Link href="/admin/orders">View all</Typography.Link>}
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          pagination={false}
          rowKey="key"
        />
      </Card>
    </div>
  );
}

