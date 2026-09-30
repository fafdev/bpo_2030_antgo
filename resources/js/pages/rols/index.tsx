import { Head } from '@inertiajs/react';
import { Form, router } from '@inertiajs/react';
import { useState } from 'react';
import RolController from '@/actions/App/Http/Controllers/RolController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as rolsIndex } from '@/routes/rols';

type Rol = {
    id: string;
    code: string;
    name: string;
    description: string | null;
};

type Props = {
    roles: Rol[];
};

export default function RolesIndex({ roles }: Props) {
    const [editingRol, setEditingRol] = useState<Rol | null>(null);

    const cancelEdit = () => setEditingRol(null);

    const handleDelete = (rol: Rol) => {
        if (!window.confirm(`Vols eliminar el rol "${rol.name}"?`)) {
            return;
        }

        router.delete(RolController.destroy.url(rol.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Rols" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h1 className="text-xl font-semibold">Rols</h1>
                    <p className="text-sm text-muted-foreground">
                        Llistat de rols disponibles al sistema.
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingRol ? 'Editar rol' : 'Crear rol'}
                    </h2>

                    <Form
                        key={editingRol?.id ?? 'create-rol'}
                        {...(editingRol
                            ? RolController.update.form(editingRol.id)
                            : RolController.store.form())}
                        options={{
                            preserveScroll: true,
                        }}
                        className="grid gap-4 md:grid-cols-3"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Codi</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="admin"
                                        defaultValue={editingRol?.code ?? ''}
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Administrador"
                                        defaultValue={editingRol?.name ?? ''}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descripcio</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        placeholder="Permisos complets del sistema"
                                        defaultValue={editingRol?.description ?? ''}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="md:col-span-3 flex gap-2">
                                    <Button disabled={processing}>
                                        {processing
                                            ? 'Guardant...'
                                            : editingRol
                                              ? 'Actualitzar rol'
                                              : 'Crear rol'}
                                    </Button>

                                    {editingRol && (
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
                        Columnes requerides: code, name. Opcional: description.
                    </p>

                    <Form
                        {...RolController.import.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                        className="flex flex-col gap-3 md:flex-row md:items-end"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="rols_csv_file">Fitxer CSV</Label>
                                    <Input
                                        id="rols_csv_file"
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
                                        : 'Importar rols'}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Codi</th>
                                <th className="px-4 py-3 font-medium">Nom</th>
                                <th className="px-4 py-3 font-medium">
                                    Descripcio
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Accions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Encara no hi ha rols creats.
                                    </td>
                                </tr>
                            )}

                            {roles.map((rol) => (
                                <tr key={rol.id} className="border-t">
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {rol.code}
                                    </td>
                                    <td className="px-4 py-3">{rol.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {rol.description ?? '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingRol(rol)
                                                }
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(rol)
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

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rols',
            href: rolsIndex(),
        },
    ],
};
