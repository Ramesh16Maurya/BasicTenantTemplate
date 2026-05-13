'use client'

import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export function MovementsTable({ initialRows }: { initialRows: Record<string, unknown>[] }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Location</TableCell>
            <TableCell align="right">Δ Qty</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initialRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary">
                  No movements yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            initialRows.map((row) => (
              <TableRow key={String(row.id)}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{String(row.goodsItemId)}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{String(row.stockLocationId)}</TableCell>
                <TableCell align="right">{String(row.quantityDelta)}</TableCell>
                <TableCell>{row.reason != null ? String(row.reason) : '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
