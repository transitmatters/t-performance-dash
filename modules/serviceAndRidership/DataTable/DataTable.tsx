import React, { useMemo } from 'react';
import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';

import styles from './DataTable.module.css';

type Value = string | number;

type Column = {
  title: string;
  values: Value[];
};

type Props = {
  caption: string;
  columns: Column[];
};

export const DataTable = (props: Props) => {
  const { caption, columns } = props;
  const dialog = useDialogState();

  const rows = useMemo(() => {
    const numRows = Math.max(...columns.map((c) => c.values.length));
    const rows: Value[][] = [];
    for (let r = 0; r < numRows; r++) {
      const row: Value[] = [];
      rows.push(row);
      for (let c = 0; c < columns.length; c++) {
        const value = columns[c].values[r] || '';
        row.push(value);
      }
    }
    return rows;
  }, [columns]);

  return (
    <>
      <DialogDisclosure {...dialog} as="button" className={styles.button}>
        Show data table: {caption}
      </DialogDisclosure>
      <Dialog {...dialog}>
        {dialog.visible && (
          <>
            <div className={styles.backdrop} />
            <div className={styles.dialog}>
              <p>Press ESC to close</p>
              <table>
                <caption>{caption}</caption>
                <tbody>
                  <tr>
                    {columns.map((column, idx) => (
                      <th key={idx}>{column.title}</th>
                    ))}
                  </tr>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((value, colIdx) => (
                        <td key={colIdx}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default DataTable;
