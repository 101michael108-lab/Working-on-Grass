import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminOrdersPage() {
    const orders = [
        { id: "ORD001", customer: "John Doe", date: "2024-05-20", status: "Fulfilled", total: "R4,620.00" },
        { id: "ORD002", customer: "Jane Smith", date: "2024-05-19", status: "Pending", total: "R550.00" },
        { id: "ORD003", customer: "Bob Johnson", date: "2024-05-18", status: "Fulfilled", total: "R5,170.00" },
    ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Orders</CardTitle>
        <CardDescription>View and manage all customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'Fulfilled' ? 'default' : 'secondary'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.total}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
