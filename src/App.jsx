import React from 'react';
import { useTable } from 'react-table';

// Create a default prop getter
const defaultPropGetter = () => ({});
const Table = ({
  columns,
  data,
  getColumnProps = defaultPropGetter,
  getRowProps = defaultPropGetter,
  getCellProps = defaultPropGetter,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} className="tableHeader">
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps(getRowProps(row))}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps([
                      getColumnProps(cell.column),
                      getCellProps(cell),
                    ])}
                    className="tableRow"
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const App = (props) => {
  const { habitsArr } = props;

  // Column Headers Start
  let colArr = [];

  // Get unique dates for header row
  const uniqueDates = [...new Set(habitsArr.map((a) => a.dateName))];
  for (let i = 0; i < uniqueDates.length; i++) {
    let payload = {
      Header: uniqueDates[i],
      accessor: uniqueDates[i],
    };
    colArr.push(payload);
  }
  colArr.unshift({ Header: 'Date', accessor: 'col1' });
  const columns = React.useMemo(() => colArr, []);
  // Column Headers End

  // Data Row start
  // Get unique habits for each data row
  const rowArr = [...new Set(habitsArr.map((a) => a.content))].map((i) => ({
    col1: i,
  }));

  for (let i of habitsArr) {
    for (let j of rowArr) {
      if (i.content === j.col1) {
        let payload = {
          [i.dateName]: i.marker,
        };
        Object.assign(j, payload);
      }
    }
  }

  const data = React.useMemo(() => rowArr, []);
  // Data Row End

  return (
    <Table
      columns={columns}
      data={data}
      getCellProps={(cellInfo) => ({
        style: {
          backgroundColor: `${cellInfo.value === 'DONE' ? 'chartreuse' : ''}`,
        },
      })}
    />
  );
};

export default App;
