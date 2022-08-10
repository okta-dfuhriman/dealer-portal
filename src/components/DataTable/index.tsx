import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, DataGridProps } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const columns: GridColDef[] = [
	{ field: 'id' },
	{ field: 'firstName', headerName: 'First Name', flex: 1 },
	{ field: 'lastName', headerName: 'Last Name', flex: 1 },
	{ field: 'email', headerName: 'Email', flex: 2 },
	{ field: 'role', headerName: 'Role', flex: 1 },
];

const ROWS: User[] = [
	{
		id: 1,
		lastName: 'Snow',
		firstName: 'Jon',
		email: 'jon.snow@atko.email',
		role: 'Dealer Admin',
		dealer: 'Autos of The North',
	},
	{
		id: 2,
		lastName: 'Lannister',
		firstName: 'Cersei',
		email: 'cersei.lannister@atko.email',
		role: 'Dealer Admin',
		dealer: 'Westeros Auto',
	},
	{
		id: 3,
		lastName: 'Lannister',
		firstName: 'Jaime',
		email: 'jaime.lannister@atko.email',
		role: 'Salesperson',
		dealer: 'Westeros Auto',
	},
	{
		id: 4,
		lastName: 'Stark',
		firstName: 'Arya',
		email: 'arya.stark@atko.email',
		role: 'Dealer Admin',
		dealer: 'Autos of The North',
	},
	{
		id: 5,
		lastName: 'Targaryen',
		firstName: 'Daenerys',
		email: 'daenerys.targaryen@atko.email',
		role: 'Org Admin',
		dealer: '',
	},
	{
		id: 6,
		lastName: '',
		firstName: 'Melisandre',
		email: 'melisandre@atko.email',
		role: 'Salesperson',
		dealer: 'Westeros Auto',
	},
	{
		id: 7,
		lastName: 'Clifford',
		firstName: 'Ferrara',
		email: 'ferrara.clifford@atko.email',
		role: 'Salesperson',
		dealer: 'A1 Mitsubishi',
	},
	{
		id: 8,
		lastName: 'Frances',
		firstName: 'Rossini',
		email: 'rossini.frances@atko.email',
		role: 'Salesperson',
		dealer: 'A1 Mitsubishi',
	},
	{
		id: 9,
		lastName: 'Roxie',
		firstName: 'Harvey',
		email: 'harvey.roxie@atko.email',
		role: 'Dealer Admin',
		dealer: 'A1 Mitsubishi',
	},
];

export interface User {
	id: string | number;
	avatarUrl?: string;
	firstName: string;
	lastName: string;
	email: string;
	status?: 'active' | 'banned';
	role: string;
	dealer: string;
}

export interface DataTableProps
	extends Omit<DataGridProps, 'rows' | 'columns'> {
	data?: User[];
}

const DataTable = ({ data, ...props }: DataTableProps) => (
	<Box sx={{ height: 400, width: '100%' }}>
		<DataGrid
			rows={data || ROWS}
			columns={columns}
			pageSize={5}
			rowsPerPageOptions={[5, 10, 100]}
			checkboxSelection
			{...props}
		/>
	</Box>
);

export default DataTable;
