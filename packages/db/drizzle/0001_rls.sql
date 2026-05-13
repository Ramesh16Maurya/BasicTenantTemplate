ALTER TABLE "goods_items" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "stock_locations" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "goods_items_tenant" ON "goods_items" AS PERMISSIVE FOR ALL TO public USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
--> statement-breakpoint
CREATE POLICY "stock_locations_tenant" ON "stock_locations" AS PERMISSIVE FOR ALL TO public USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
--> statement-breakpoint
CREATE POLICY "stock_movements_tenant" ON "stock_movements" AS PERMISSIVE FOR ALL TO public USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
