"use client";

import { Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DollarSign, ShoppingBag, Users, Boxes, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statCards = [
  { title: "Total Revenue", value: "$248.4K", trend: "+18%", positive: true, icon: DollarSign },
  { title: "Total Orders", value: "12,482", trend: "+5%", positive: true, icon: ShoppingBag },
  { title: "New Customers", value: "1,205", trend: "+2%", positive: true, icon: Users },
  { title: "Active Products", value: "824", trend: "-1%", positive: false, icon: Boxes },
];

const monthlyRevenue = [
  { month: "Jan", value: 24 },
  { month: "Feb", value: 28 },
  { month: "Mar", value: 32 },
  { month: "Apr", value: 30 },
  { month: "May", value: 34 },
  { month: "Jun", value: 38 },
  { month: "Jul", value: 36 },
  { month: "Aug", value: 40 },
  { month: "Sep", value: 42 },
  { month: "Oct", value: 46 },
  { month: "Nov", value: 48 },
  { month: "Dec", value: 52 },
];

const categoryShare = [
  { name: "Skincare", value: 38, color: "#16a34a" },
  { name: "Body Care", value: 24, color: "#0ea5e9" },
  { name: "Fragrance", value: 20, color: "#f97316" },
  { name: "Wellness", value: 18, color: "#a855f7" },
];

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

const statusColorMap: Record<OrderStatus, string> = {
  PENDING: "gold",
  CONFIRMED: "blue",
  SHIPPING: "purple",
  COMPLETED: "green",
  CANCELLED: "red",
};

interface RecentOrder {
  key: string;
  orderId: string;
  customer: string;
  status: OrderStatus;
  amount: string;
}

const recentOrders: RecentOrder[] = [
  { key: "1", orderId: "#ORD-92018", customer: "Jane Cooper", status: "SHIPPING", amount: "$320.00" },
  { key: "2", orderId: "#ORD-92017", customer: "Devon Lane", status: "CONFIRMED", amount: "$145.50" },
  { key: "3", orderId: "#ORD-92016", customer: "Wade Warren", status: "PENDING", amount: "$89.00" },
  { key: "4", orderId: "#ORD-92015", customer: "Cody Fisher", status: "COMPLETED", amount: "$540.10" },
  { key: "5", orderId: "#ORD-92014", customer: "Kristin Watson", status: "CANCELLED", amount: "$120.00" },
];

const columns: ColumnsType<RecentOrder> = [
  { title: "Order ID", dataIndex: "orderId", key: "orderId" },
  { title: "Customer", dataIndex: "customer", key: "customer" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: OrderStatus) => <Tag color={statusColorMap[status]}>{status}</Tag>,
  },
  { title: "Amount", dataIndex: "amount", key: "amount" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                </div>
                <div className={card.positive ? "text-emerald-500" : "text-red-500"}>
                  {card.positive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  <span className="text-sm font-medium">{card.trend}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 rounded-2xl border border-slate-100 shadow-sm">
          <Typography.Title level={5}>Revenue (12 months)</Typography.Title>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#16a34a" fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <Typography.Title level={5}>Category share</Typography.Title>
          <div className="mt-4 flex h-72 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {categoryShare.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryShare.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-semibold text-slate-900">{entry.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-slate-100 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Typography.Title level={5} style={{ margin: 0 }}>
            Recent Orders
          </Typography.Title>
          <Typography.Link href="#">View all</Typography.Link>
        </div>
        <Table columns={columns} dataSource={recentOrders} pagination={false} />
      </Card>
    </div>
  );
}
