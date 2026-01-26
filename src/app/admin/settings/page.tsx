import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your store settings and integrations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
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
         <div className="space-y-2">
            <h3 className="text-lg font-semibold">Payment Gateway</h3>
            <p className="text-sm text-muted-foreground">Payment gateway integration settings will be here.</p>
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  )
}
