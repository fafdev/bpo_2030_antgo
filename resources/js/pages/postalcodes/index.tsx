import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PostalcodeController from '@/actions/App/Http/Controllers/PostalcodeController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as postalcodesIndex } from '@/routes/postalcodes';

type Postalcode = {
    id: string;
    code: string;
    city: string | null;
};

type Props = {
    postalcodes: Postalcode[];
};

export default function PostalcodesIndex({ postalcodes }: Props) {
    const [editingPostalcode, setEditingPostalcode] = useState<Postalcode | null>(null);

    const cancelEdit = () => {
        setEditingPostalcode(null);
    };

    const handleDelete = (postalcode: Postalcode) => {
        if (!window.confirm(`Vols eliminar el codi postal "${postalcode.code}"?`)) {
            return;
        }

        router.delete(PostalcodeController.destroy.url(postalcode.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Postal Codes ES" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h1 className="text-xl font-semibold">Postal Codes ES</h1>
                    <p className="text-sm text-muted-foreground">
                        Manteniment de codis postals d'Espanya.
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingPostalcode ? 'Editar codi postal' : 'Crear codi postal'}
                    </h2>

                    <Form
                        key={editingPostalcode?.id ?? 'create-postalcode'}
                        {...(editingPostalcode
                            ? PostalcodeController.update.form(editingPostalcode.id)
                            : PostalcodeController.store.form())}
                        options={{
                            preserveScroll: true,
                            onSuccess: () => {
                                setEditingPostalcode(null);
                            },
                        }}
                        className="grid gap-4 md:grid-cols-3"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Codi postal</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="08001"
                                        defaultValue={editingPostalcode?.code ?? ''}
                                        maxLength={5}
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="city">Ciutat (opcional)</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        placeholder="Barcelona"
                                        defaultValue={editingPostalcode?.city ?? ''}
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="md:col-span-3 flex gap-2">
                                    <Button disabled={processing}>
                                        {processing
                                            ? 'Guardant...'
                                            : editingPostalcode
                                              ? 'Actualitzar codi postal'
                                              : 'Crear codi postal'}
                                    </Button>

                                    {editingPostalcode && (
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
                        Columna requerida: code. Opcional: city. Nomes codis postals d'Espanya (01000-52999).
                    </p>

                    <Form
                        {...PostalcodeController.import.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                        className="flex flex-col gap-3 md:flex-row md:items-end"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="postalcodes_csv_file">Fitxer CSV</Label>
                                    <Input
                                        id="postalcodes_csv_file"
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
                                        : 'Importar codis postals'}
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
                                <th className="px-4 py-3 font-medium">Ciutat</th>
                                <th className="px-4 py-3 font-medium">Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postalcodes.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Encara no hi ha codis postals.
                                    </td>
                                </tr>
                            )}

                            {postalcodes.map((postalcode) => (
                                <tr key={postalcode.id} className="border-t">
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {postalcode.code}
                                    </td>
                                    <td className="px-4 py-3">{postalcode.city ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setEditingPostalcode(postalcode)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(postalcode)}
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

PostalcodesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Postal Codes ES',
            href: postalcodesIndex(),
        },
    ],
};
