import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStaticUsers } from '@/contexts/AuthContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const roleOptions = [
	{ value: 'production', label: 'Production' },
	{ value: 'stores', label: 'Stores' },
	{ value: 'qa', label: 'QA' },
	{ value: 'hod', label: 'HOD' },
	{ value: 'admin', label: 'Admin' },
];

const UserManagement = () => {
	// For demo, use local state. In real app, connect to backend or context.
	const [users, setUsers] = useState(getStaticUsers());
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		username: '',
		password: '',
		role: 'production',
	});
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const pageSize = 5;

	const filteredUsers = useMemo(
		() =>
			users.filter(
				u =>
					u.name.toLowerCase().includes(search.toLowerCase()) ||
					u.username.toLowerCase().includes(search.toLowerCase()) ||
					u.role.toLowerCase().includes(search.toLowerCase())
			),
		[users, search]
	);

	const paginatedUsers = useMemo(
		() => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
		[filteredUsers, page]
	);

	const totalPages = Math.ceil(filteredUsers.length / pageSize);

	const handleAdd = () => {
		if (!formData.name || !formData.username || !formData.password) return;
		setUsers([
			...users,
			{
				id: Date.now().toString(),
				...formData,
				role: formData.role as "production" | "stores" | "qa" | "hod" | "admin",
			},
		]);
		setFormData({ name: '', username: '', password: '', role: 'production' });
		setShowAddForm(false);
	};

	const handleEdit = (user: any) => {
		setEditingId(user.id);
		setFormData({
			name: user.name,
			username: user.username,
			password: user.password,
			role: user.role,
		});
	};

	const handleUpdate = () => {
		setUsers(users.map(u => (u.id === editingId ? { ...u, ...formData, role: formData.role as "production" | "stores" | "qa" | "hod" | "admin" } : u)));
		setEditingId(null);
		setFormData({ name: '', username: '', password: '', role: 'production' });
	};

	const handleDelete = (id: string) => {
		setUsers(users.filter(u => u.id !== id));
	};

	const cancelEdit = () => {
		setEditingId(null);
		setShowAddForm(false);
		setFormData({ name: '', username: '', password: '', role: 'production' });
	};

	const getRoleBadge = (role: string) => {
		const roleConfig = {
			production: { variant: 'default' as const, label: 'Production' },
			stores: { variant: 'secondary' as const, label: 'Stores' },
			qa: { variant: 'outline' as const, label: 'QA' },
			hod: { variant: 'destructive' as const, label: 'HOD' },
			admin: { variant: 'default' as const, label: 'Admin' },
		};
		const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.production;
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>User Management</CardTitle>
					<Button onClick={() => setShowAddForm(true)} disabled={showAddForm || editingId !== null}>
						<Plus className="w-4 h-4 mr-2" />
						Add User
					</Button>
				</CardHeader>
				<CardContent>
					{showAddForm && (
						<div className="mb-6 p-4 border rounded-lg bg-gray-50">
							<h3 className="text-lg font-medium mb-4">Add New User</h3>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={e => setFormData({ ...formData, name: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										value={formData.username}
										onChange={e => setFormData({ ...formData, username: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										value={formData.password}
										onChange={e => setFormData({ ...formData, password: e.target.value })}
									/>
								</div>
								<div>
									<Label htmlFor="role">Role</Label>
									<Select
										value={formData.role}
										onValueChange={value => setFormData({ ...formData, role: value })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											{roleOptions.map(opt => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex space-x-2 mt-4">
								<Button onClick={handleAdd}>
									<Save className="w-4 h-4 mr-2" />
									Save
								</Button>
								<Button variant="outline" onClick={cancelEdit}>
									<X className="w-4 h-4 mr-2" />
									Cancel
								</Button>
							</div>
						</div>
					)}

					<Input
						placeholder="Search users..."
						value={search}
						onChange={e => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="mb-4 w-full max-w-xs"
					/>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Username</TableHead>
								<TableHead>Password</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedUsers.map(user => (
								<TableRow key={user.id}>
									<TableCell>
										{editingId === user.id ? (
											<Input
												value={formData.name}
												onChange={e => setFormData({ ...formData, name: e.target.value })}
											/>
										) : (
											user.name
										)}
									</TableCell>
									<TableCell>
										{editingId === user.id ? (
											<Input
												value={formData.username}
												onChange={e => setFormData({ ...formData, username: e.target.value })}
											/>
										) : (
											user.username
										)}
									</TableCell>
									<TableCell>
										{editingId === user.id ? (
											<Input
												value={formData.password}
												onChange={e => setFormData({ ...formData, password: e.target.value })}
											/>
										) : (
											user.password
										)}
									</TableCell>
									<TableCell>
										{editingId === user.id ? (
											<Select
												value={formData.role}
												onValueChange={value => setFormData({ ...formData, role: value })}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select role" />
												</SelectTrigger>
												<SelectContent>
													{roleOptions.map(opt => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											getRoleBadge(user.role)
										)}
									</TableCell>
									<TableCell>
										{editingId === user.id ? (
											<>
												<Button size="sm" onClick={handleUpdate}>
													<Save className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="outline" onClick={cancelEdit}>
													<X className="w-4 h-4" />
												</Button>
											</>
										) : (
											<>
												<Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
													<Edit className="w-4 h-4" />
												</Button>
												<Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
													<Trash2 className="w-4 h-4" />
												</Button>
											</>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="flex justify-end items-center gap-2 mt-2">
						<Button disabled={page === 1} onClick={() => setPage(page - 1)} size="icon">
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<span>
							Page {page} of {totalPages}
						</span>
						<Button disabled={page === totalPages} onClick={() => setPage(page + 1)} size="icon">
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserManagement;
