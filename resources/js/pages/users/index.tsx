import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as usersIndex } from '@/routes/users';

type Rol = {
    id: string;
    code: string;
    name: string;
};

type ManagedUser = {
    id: string;
    name: string;
    email: string;
    rol_id: string | null;
    rol: Rol | null;
};

type Props = {
    users: ManagedUser[];
    roles: Rol[];
};

export default function UsersIndex({ users, roles }: Props) {
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    const cancelEdit = () => setEditingUser(null);

    const handleDelete = (user: ManagedUser) => {
        if (!window.confirm(`Vols eliminar l'usuari "${user.name}"?`)) {
            return;
        }

        router.delete(UserController.destroy.url(user.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Usuaris" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h1 className="text-xl font-semibold">Usuaris</h1>
                    <p className="text-sm text-muted-foreground">
                        Manteniment d'usuaris del sistema.
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingUser ? 'Editar usuari' : 'Crear usuari'}
                    </h2>

                    <Form
                        key={editingUser?.id ?? 'create-user'}
                        {...(editingUser
                            ? UserController.update.form(editingUser.id)
                            : UserController.store.form())}
                        options={{
                            preserveScroll: true,
                        }}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={editingUser?.name ?? ''}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={editingUser?.email ?? ''}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Contrasenya
                                        {editingUser
                                            ? ' (deixa buit per mantenir-la)'
                                            : ''}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required={!editingUser}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rol_id">Rol</Label>
                                    <select
                                        id="rol_id"
                                        name="rol_id"
                                        defaultValue={editingUser?.rol_id ?? ''}
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Sense rol</option>
                                        {roles.map((rol) => (
                                            <option key={rol.id} value={rol.id}>
                                                {rol.name} ({rol.code})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.rol_id} />
                                </div>

                                <div className="md:col-span-2 flex gap-2">
                                    <Button disabled={processing}>
                                        {processing
                                            ? 'Guardant...'
                                            : editingUser
                                              ? 'Actualitzar usuari'
                                              : 'Crear usuari'}
                                    </Button>

                                    {editingUser && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={cancelEdit}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-3 text-lg font-semibold">Importar CSV</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Columnes requerides: name, email. Opcional: password,
                        rol_code.
                    </p>

                    <Form
                        {...UserController.import.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                        className="flex flex-col gap-3 md:flex-row md:items-end"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="users_csv_file">Fitxer CSV</Label>
                                    <Input
                                        id="users_csv_file"
                                        name="file"
                                        type="file"
                                        accept=".csv,text/csv,.txt"
                                        required
                                    />
                                    <InputError message={errors.file} />
                                </div>

                                <Button disabled={processing}>
                                    {processing
                                        ? 'Important...'
                                        : 'Importar usuaris'}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Nom</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Rol</th>
                                <th className="px-4 py-3 font-medium">
                                    Accions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Encara no hi ha usuaris.
                                    </td>
                                </tr>
                            )}

                            {users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {user.rol
                                            ? `${user.rol.name} (${user.rol.code})`
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingUser(user)
                                                }
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(user)
                                                }
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Usuaris',
            href: usersIndex(),
        },
    ],
};
