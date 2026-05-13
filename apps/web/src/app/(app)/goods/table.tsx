'use client'

import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export function GoodsTable({ initialRows }: { initialRows: Record<string, unknown>[] }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Items
        </Typography>
        <Button size="small" variant="outlined" disabled title="Add flow via API or follow-up">
          Add item
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>SKU</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initialRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body2" color="text.secondary">
                  No goods yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            initialRows.map((row) => (
              <TableRow key={String(row.id)}>
                <TableCell>{String(row.sku)}</TableCell>
                <TableCell>{String(row.name)}</TableCell>
                <TableCell>{String(row.unit)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
