import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "R125,430.00", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Orders", value: "+1,234", icon: ShoppingCart, change: "+180.1% from last month" },
    { title: "New Users", value: "+230", icon: Users, change: "+35 from last month" },
    { title: "Products in Stock", value: "89", icon: Package, change: "2 new products added" },
  ]
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>A list of the most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Order management functionality will be implemented here.</p>
            </CardContent>
        </Card>
       </div>
    </div>
  )
}
