"use client";

import { useMemo } from "react";
import { Card, Col, Row, Tag, Table, Typography, Space } from "antd";
import {
  Wallet,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useCssVariableValue } from "@/hooks/use-css-variable-value";

const statCards = [
  {
    title: "Total Revenue",
    value: "$248.4K",
    change: "+18.4%",
    trend: "up",
    description: "vs last month",
    icon: Wallet,
    isAlert: false,
  },
  {
    title: "Total Orders",
    value: "3,482",
    change: "+5.4%",
    trend: "up",
    description: "vs last month",
    icon: ShoppingBag,
    isAlert: false,
  },
  {
    title: "New Customers",
    value: "1,205",
    change: "+2.1%",
    trend: "up",
    description: "vs last month",
    icon: Users,
    isAlert: false,
  },
  {
    title: "Low Stock Alert",
    value: "14 items",
    change: "-3 items",
    trend: "down",
    description: "critical threshold",
    icon: AlertTriangle,
    isAlert: true,
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

export default function DashboardOverviewPage() {
  const primaryColor = useCssVariableValue("--primary", "#4f46e5");
  const accentColor = useCssVariableValue("--accent", "#a78bfa");
  const gridColor = useCssVariableValue("--border", "#eef0f4");
  const cardColor = useCssVariableValue("--card", "#ffffff");
  const warningColor = useCssVariableValue("--warning", "#f59e0b");
  const successColor = useCssVariableValue("--success", "#22c55e");
  const infoColor = useCssVariableValue("--info", "#0ea5e9");
  const destructiveColor = useCssVariableValue("--destructive", "#ef4444");

  const statusColorMap = useMemo<Record<OrderStatus, string>>(
    () => ({
      PENDING: warningColor,
      CONFIRMED: infoColor,
      SHIPPING: primaryColor,
      COMPLETED: successColor,
      CANCELLED: destructiveColor,
    }),
    [
      destructiveColor,
      infoColor,
      primaryColor,
      successColor,
      warningColor,
    ]
  );

  const columns: ColumnsType<RecentOrder> = useMemo(
    () => [
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
    ],
    [statusColorMap]
  );

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const cardBorderClass = card.isAlert
            ? "border-warning/50 bg-warning/10"
            : "border-border";
          const iconWrapperClass = card.isAlert
            ? "bg-warning/20 text-warning"
            : "bg-primary/10 text-primary";
          const trendClass =
            card.trend === "up"
              ? "text-success"
              : card.isAlert
              ? "text-warning"
              : "text-destructive";

          return (
            <Col xs={24} sm={12} md={12} lg={6} key={card.title}>
              <div
                className={cn(
                  "rounded-2xl border bg-card p-5 shadow-sm transition-colors",
                  cardBorderClass
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      iconWrapperClass
                    )}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {card.description}
                  </span>
                  <Space
                    size={4}
                    align="center"
                    className={cn("font-semibold", trendClass)}
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Revenue Over Time"
            className="chart-card"
            extra={
              <Typography.Text type="secondary">Last 7 days</Typography.Text>
            }
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueSeries}>
                  <CartesianGrid vertical={false} stroke={gridColor} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={primaryColor}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: cardColor,
                    }}
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="sales"
                    radius={[12, 12, 0, 0]}
                    fill={accentColor}
                  />
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
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={recentOrders}
            pagination={false}
            rowKey="key"
            scroll={{ x: "max-content" }}
          />
        </div>
      </Card>
    </div>
  );
}
