'use client'

import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export function LocationsTable({ initialRows }: { initialRows: Record<string, unknown>[] }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initialRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="body2" color="text.secondary">
                  No locations yet.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            initialRows.map((row) => (
              <TableRow key={String(row.id)}>
                <TableCell>{String(row.name)}</TableCell>
                <TableCell>{row.code != null ? String(row.code) : '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
