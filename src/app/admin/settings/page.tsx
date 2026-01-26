import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your store settings and integrations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input id="store-name" defaultValue="Working on Grass" />
                </div>
                 <div>
                    <Label htmlFor="store-email">Contact Email</Label>
                    <Input id="store-email" type="email" defaultValue="courses@alut.co.za" />
                </div>
            </div>
        </div>
        
        <Separator />

         <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Gateway</h3>
            <p className="text-sm text-muted-foreground">
                Configure your payment gateway settings here. These are for display purposes and are not currently functional.
            </p>
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="payfast-merchant-id">PayFast Merchant ID</Label>
                    <Input id="payfast-merchant-id" placeholder="10000100" />
                </div>
                 <div>
                    <Label htmlFor="payfast-merchant-key">PayFast Merchant Key</Label>
                    <Input id="payfast-merchant-key" type="password" placeholder="••••••••••••••••" />
                </div>
            </div>
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  )
}
