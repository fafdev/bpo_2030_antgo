import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import CountryController from '@/actions/App/Http/Controllers/CountryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as countriesIndex } from '@/routes/countries';

type Country = {
    id: string;
    code: string;
    name: string;
};

type Props = {
    countries: Country[];
};

export default function CountriesIndex({ countries }: Props) {
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);

    const cancelEdit = () => {
        setEditingCountry(null);
    };

    const handleDelete = (country: Country) => {
        if (!window.confirm(`Vols eliminar el pais "${country.name}"?`)) {
            return;
        }

        router.delete(CountryController.destroy.url(country.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Countries" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h1 className="text-xl font-semibold">Countries</h1>
                    <p className="text-sm text-muted-foreground">
                        Manteniment del cataleg de paisos ISO.
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingCountry ? 'Editar pais' : 'Crear pais'}
                    </h2>

                    <Form
                        key={editingCountry?.id ?? 'create-country'}
                        {...(editingCountry
                            ? CountryController.update.form(editingCountry.id)
                            : CountryController.store.form())}
                        options={{
                            preserveScroll: true,
                            onSuccess: () => {
                                setEditingCountry(null);
                            },
                        }}
                        className="grid gap-4 md:grid-cols-3"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">ISO-2</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="ES"
                                        defaultValue={editingCountry?.code ?? ''}
                                        maxLength={2}
                                        required
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Spain"
                                        defaultValue={editingCountry?.name ?? ''}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="md:col-span-3 flex gap-2">
                                    <Button disabled={processing}>
                                        {processing
                                            ? 'Guardant...'
                                            : editingCountry
                                              ? 'Actualitzar pais'
                                              : 'Crear pais'}
                                    </Button>

                                    {editingCountry && (
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

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">ISO-2</th>
                                <th className="px-4 py-3 font-medium">Nom</th>
                                <th className="px-4 py-3 font-medium">Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Encara no hi ha paisos.
                                    </td>
                                </tr>
                            )}

                            {countries.map((country) => (
                                <tr key={country.id} className="border-t">
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {country.code}
                                    </td>
                                    <td className="px-4 py-3">{country.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingCountry(country)
                                                }
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(country)
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

CountriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Countries',
            href: countriesIndex(),
        },
    ],
};
