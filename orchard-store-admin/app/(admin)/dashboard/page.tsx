'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Activity,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const statsCards = [
  {
    title: 'Tổng doanh thu',
    value: '₫1.24B',
    change: '+12.4%',
    trend: 'up',
    sub: 'So với tháng trước',
    icon: DollarSign,
    accent: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
  {
    title: 'Đơn hàng mới',
    value: '1,284',
    change: '+8.2%',
    trend: 'up',
    sub: 'Trong 30 ngày gần đây',
    icon: ShoppingBag,
    accent: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
  },
  {
    title: 'Khách hàng VIP',
    value: '342',
    change: '+5.1%',
    trend: 'up',
    sub: 'Khách hàng Platinum+',
    icon: Users,
    accent: 'from-amber-500/10 via-amber-500/5 to-transparent',
  },
  {
    title: 'Sản phẩm tồn kho',
    value: '3,982',
    change: '-2.3%',
    trend: 'down',
    sub: 'Đang theo dõi tái nhập',
    icon: Package,
    accent: 'from-rose-500/10 via-rose-500/5 to-transparent',
  },
];

const performanceData = [
  { name: 'Mon', revenue: 420, orders: 35 },
  { name: 'Tue', revenue: 520, orders: 42 },
  { name: 'Wed', revenue: 610, orders: 48 },
  { name: 'Thu', revenue: 480, orders: 39 },
  { name: 'Fri', revenue: 720, orders: 55 },
  { name: 'Sat', revenue: 690, orders: 53 },
  { name: 'Sun', revenue: 560, orders: 44 },
];

const recentOrders = [
  {
    id: '#ORD-2401',
    customer: 'Nguyễn Hoài Nam',
    email: 'nam.nguyen@example.com',
    total: '₫3,240,000',
    status: 'Đã giao',
    statusColor: 'text-emerald-600 bg-emerald-50',
    date: '12/11/2025',
  },
  {
    id: '#ORD-2398',
    customer: 'Trần Lê Anh Thư',
    email: 'thu.tran@example.com',
    total: '₫1,580,000',
    status: 'Đang xử lý',
    statusColor: 'text-amber-600 bg-amber-50',
    date: '11/11/2025',
  },
  {
    id: '#ORD-2395',
    customer: 'Phạm Văn Hiếu',
    email: 'hieu.pham@example.com',
    total: '₫5,420,000',
    status: 'Đang giao',
    statusColor: 'text-indigo-600 bg-indigo-50',
    date: '11/11/2025',
  },
  {
    id: '#ORD-2392',
    customer: 'Đặng Thuỳ Dung',
    email: 'dung.dang@example.com',
    total: '₫2,130,000',
    status: 'Đã huỷ',
    statusColor: 'text-rose-600 bg-rose-50',
    date: '10/11/2025',
  },
];

const topProducts = [
  {
    name: 'Dior Sauvage EDP 100ml',
    sku: 'SKU-DS100',
    category: 'Nước hoa nam',
    revenue: '₫125M',
    sold: 210,
    trend: '+18%',
  },
  {
    name: 'Chanel Coco Mademoiselle',
    sku: 'SKU-CC50',
    category: 'Nước hoa nữ',
    revenue: '₫102M',
    sold: 185,
    trend: '+12%',
  },
  {
    name: 'Lancôme Advanced Génifique',
    sku: 'SKU-LG30',
    category: 'Skincare',
    revenue: '₫89M',
    sold: 142,
    trend: '+9%',
  },
];

const quickActions = [
  {
    title: 'Tạo sản phẩm mới',
    desc: 'Thêm sản phẩm vào catalog',
    icon: Package,
  },
  {
    title: 'Chiến dịch khuyến mãi',
    desc: 'Thiết lập voucher/flash sale',
    icon: Activity,
  },
  {
    title: 'Báo cáo doanh thu',
    desc: 'Xuất file excel/PDF',
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  const chartData = useMemo(() => performanceData, []);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Orchard Insight
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard tổng quan</h1>
        <p className="text-slate-500">
          Số liệu mock (lấy cảm hứng từ Saledash). Sẵn sàng nối API thực tế khi backend hoàn tất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <Card
              key={card.title}
              className="border-0 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-slate-800" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={cn(
                      'flex items-center gap-1 text-sm font-semibold',
                      card.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    <TrendIcon className="h-4 w-4" />
                    {card.change}
                  </span>
                  <span className="text-xs text-slate-500">{card.sub}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-0 rounded-3xl shadow-lg shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Hiệu suất doanh thu</CardTitle>
              <p className="text-sm text-slate-500">
                Doanh thu &amp; đơn hàng (mock dữ liệu)
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Doanh thu
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Đơn hàng
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-slate-500">Các thao tác thường dùng</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-500/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{action.title}</p>
                      <p className="text-sm text-slate-500">{action.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <p className="text-sm text-slate-500">Dữ liệu mock</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-900">{order.customer}</p>
                  <p className="text-xs text-slate-500">{order.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{order.total}</p>
                  <p className="text-xs text-slate-500">{order.date}</p>
                  <span
                    className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-lg shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <p className="text-sm text-slate-500">Theo doanh thu mock</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.sku}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                  <p className="text-xs text-slate-400 mt-1">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{product.revenue}</p>
                  <p className="text-xs text-slate-500">{product.sold} đã bán</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-1">
                    <ArrowUpRight className="h-4 w-4" />
                    {product.trend}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

