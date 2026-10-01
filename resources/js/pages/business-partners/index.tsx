import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import BusinessPartnerController from '@/actions/App/Http/Controllers/BusinessPartnerController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as businessPartnersIndex } from '@/routes/business-partners';

type Address = {
    id?: string;
    address_type: string;
    line_1: string;
    line_2: string | null;
    city: string;
    state: string | null;
    postal_code: string | null;
    country_code: string;
    is_primary: boolean;
};

type BusinessPartner = {
    id: string;
    code: string;
    tax_id: string | null;
    type: 'person' | 'company';
    company_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    birth_date: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    addresses: Address[];
};

type Props = {
    businessPartners: BusinessPartner[];
};

type BusinessPartnerPayload = {
    tax_id: string;
    type: 'person' | 'company';
    company_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    birth_date: string;
    email: string;
    phone: string;
    mobile: string;
    addresses: Address[];
};

type TaxIdKind = 'nif' | 'nie' | 'cif' | null;

const normalizeTaxId = (value: string): string =>
    value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const isValidNif = (value: string): boolean => {
    if (!/^\d{8}[A-Z]$/.test(value)) {
        return false;
    }

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = Number(value.slice(0, 8));

    return value[8] === letters[number % 23];
};

const isValidNie = (value: string): boolean => {
    if (!/^[XYZ]\d{7}[A-Z]$/.test(value)) {
        return false;
    }

    const prefix = { X: '0', Y: '1', Z: '2' };
    const mappedValue = `${prefix[value[0] as 'X' | 'Y' | 'Z']}${value.slice(1, 8)}`;
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';

    return value[8] === letters[Number(mappedValue) % 23];
};

const isValidCif = (value: string): boolean => {
    if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(value)) {
        return false;
    }

    const digits = value.slice(1, 8);
    const control = value[8];
    let sumEven = 0;
    let sumOdd = 0;

    for (let index = 0; index < digits.length; index += 1) {
        const digit = Number(digits[index]);

        if (index % 2 === 0) {
            const doubled = digit * 2;
            sumOdd += Math.floor(doubled / 10) + (doubled % 10);
        } else {
            sumEven += digit;
        }
    }

    const total = sumEven + sumOdd;
    const controlDigit = (10 - (total % 10)) % 10;
    const controlLetter = 'JABCDEFGHI'[controlDigit];
    const firstLetter = value[0];

    if (['P', 'Q', 'R', 'S', 'N', 'W'].includes(firstLetter)) {
        return control === controlLetter;
    }

    if (['A', 'B', 'E', 'H'].includes(firstLetter)) {
        return control === String(controlDigit);
    }

    return control === String(controlDigit) || control === controlLetter;
};

const detectTaxIdKind = (value: string): TaxIdKind => {
    if (isValidCif(value)) {
        return 'cif';
    }

    if (isValidNif(value)) {
        return 'nif';
    }

    if (isValidNie(value)) {
        return 'nie';
    }

    return null;
};

const emptyAddress = (): Address => ({
    address_type: 'main',
    line_1: '',
    line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country_code: 'ES',
    is_primary: true,
});

export default function BusinessPartnersIndex({ businessPartners }: Props) {
    const [editingBusinessPartner, setEditingBusinessPartner] =
        useState<BusinessPartner | null>(null);

    const { data, setData, errors, processing, reset, post, patch } =
        useForm<BusinessPartnerPayload>({
            tax_id: '',
            type: 'person',
            company_name: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            birth_date: '',
            email: '',
            phone: '',
            mobile: '',
            addresses: [emptyAddress()],
        });

    const taxIdKind = detectTaxIdKind(data.tax_id);
    const displayedCode = editingBusinessPartner?.code ?? 'BP-0000000';
    const taxIdHint =
        data.tax_id.length === 0
            ? 'Introduce NIF, NIE o CIF.'
            : taxIdKind === 'cif'
              ? 'CIF detectado. Tipo asignado: company.'
              : taxIdKind === 'nif'
                ? 'NIF detectado. Tipo asignado: person.'
                : taxIdKind === 'nie'
                  ? 'NIE detectado. Tipo asignado: person.'
                  : 'Tax ID no valido aun.';

    const handleTaxIdChange = (value: string) => {
        const normalizedTaxId = normalizeTaxId(value);
        const detectedKind = detectTaxIdKind(normalizedTaxId);
        const nextType = detectedKind === 'cif' ? 'company' : 'person';

        setData('tax_id', normalizedTaxId);

        if (nextType === 'company') {
            setData((previousData) => ({
                ...previousData,
                type: 'company',
                first_name: '',
                middle_name: '',
                last_name: '',
            }));

            return;
        }

        setData((previousData) => ({
            ...previousData,
            type: 'person',
            company_name: '',
        }));
    };

    const hydrateForm = (businessPartner: BusinessPartner) => {
        const normalizedTaxId = normalizeTaxId(businessPartner.tax_id ?? '');
        const detectedKind = detectTaxIdKind(normalizedTaxId);

        setData({
            tax_id: normalizedTaxId,
            type:
                detectedKind === 'cif'
                    ? 'company'
                    : detectedKind === 'nif' || detectedKind === 'nie'
                      ? 'person'
                      : businessPartner.type,
            company_name: businessPartner.company_name,
            first_name: businessPartner.first_name,
            middle_name: businessPartner.middle_name ?? '',
            last_name: businessPartner.last_name,
            birth_date: businessPartner.birth_date ?? '',
            email: businessPartner.email ?? '',
            phone: businessPartner.phone ?? '',
            mobile: businessPartner.mobile ?? '',
            addresses:
                businessPartner.addresses.length > 0
                    ? businessPartner.addresses.map((address) => ({
                          ...address,
                          line_2: address.line_2 ?? '',
                          state: address.state ?? '',
                          postal_code: address.postal_code ?? '',
                      }))
                    : [emptyAddress()],
        });
    };

    const cancelEdit = () => {
        setEditingBusinessPartner(null);
        reset();
        setData('addresses', [emptyAddress()]);
    };

    const handleDelete = (businessPartner: BusinessPartner) => {
        if (
            !window.confirm(
                `Vols eliminar el Business Partner "${businessPartner.code}"?`,
            )
        ) {
            return;
        }

        router.delete(BusinessPartnerController.destroy.url(businessPartner.id), {
            preserveScroll: true,
        });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (editingBusinessPartner) {
            patch(BusinessPartnerController.update.url(editingBusinessPartner.id), {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEdit();
                },
            });

            return;
        }

        post(BusinessPartnerController.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('addresses', [emptyAddress()]);
            },
        });
    };

    return (
        <>
            <Head title="Business Partners" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h1 className="text-xl font-semibold">Business Partners</h1>
                    <p className="text-sm text-muted-foreground">
                        Manteniment de Business Partners i les seves adreces.
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingBusinessPartner
                            ? 'Editar Business Partner'
                            : 'Crear Business Partner'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(() => {
                            const currentAddresses = data.addresses;

                            const updateAddresses = (addresses: Address[]) => {
                                setData('addresses', addresses);
                            };

                            const setPrimaryAddress = (index: number) => {
                                const nextAddresses = currentAddresses.map(
                                    (address, addressIndex) => ({
                                        ...address,
                                        is_primary: addressIndex === index,
                                    }),
                                );

                                updateAddresses(nextAddresses);
                            };

                            return (
                                <>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="code">Codi</Label>
                                            <Input
                                                id="code"
                                                value={displayedCode}
                                                readOnly
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Es genera automaticament com BP- + 7 digits.
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Tipus</Label>
                                            <Input
                                                id="type"
                                                value={data.type}
                                                readOnly
                                            />
                                            <InputError message={errors.type} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="tax_id">NIF/NIE/CIF</Label>
                                            <Input
                                                id="tax_id"
                                                value={data.tax_id}
                                                onChange={(event) =>
                                                    handleTaxIdChange(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError message={errors.tax_id} />
                                            <p className="text-xs text-muted-foreground">
                                                {taxIdHint}
                                            </p>
                                        </div>

                                        {data.type === 'company' && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="company_name">
                                                    Empresa
                                                </Label>
                                                <Input
                                                    id="company_name"
                                                    value={data.company_name}
                                                    onChange={(event) =>
                                                        setData(
                                                            'company_name',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.company_name}
                                                />
                                            </div>
                                        )}

                                        {data.type === 'person' && (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="first_name">
                                                        Nom
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        value={data.first_name}
                                                        onChange={(event) =>
                                                            setData(
                                                                'first_name',
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.first_name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="middle_name">
                                                        Segon nom
                                                    </Label>
                                                    <Input
                                                        id="middle_name"
                                                        value={data.middle_name}
                                                        onChange={(event) =>
                                                            setData(
                                                                'middle_name',
                                                                event.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors.middle_name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="last_name">
                                                        Cognom
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        value={data.last_name}
                                                        onChange={(event) =>
                                                            setData(
                                                                'last_name',
                                                                event.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.last_name}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="birth_date">
                                                Data de naixement
                                            </Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(event) =>
                                                    setData(
                                                        'birth_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.birth_date}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData('email', event.target.value)
                                                }
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Telefon</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(event) =>
                                                    setData('phone', event.target.value)
                                                }
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="mobile">Mobil</Label>
                                            <Input
                                                id="mobile"
                                                value={data.mobile}
                                                onChange={(event) =>
                                                    setData('mobile', event.target.value)
                                                }
                                            />
                                            <InputError message={errors.mobile} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold">
                                                Adreces
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    updateAddresses([
                                                        ...currentAddresses,
                                                        {
                                                            ...emptyAddress(),
                                                            is_primary:
                                                                currentAddresses.length ===
                                                                0,
                                                        },
                                                    ])
                                                }
                                            >
                                                Afegir adreca
                                            </Button>
                                        </div>

                                        <InputError message={errors.addresses} />

                                        <div className="space-y-4">
                                            {currentAddresses.map(
                                                (address, addressIndex) => (
                                                    <div
                                                        key={address.id ?? `new-${addressIndex}`}
                                                        className="rounded-md border p-3"
                                                    >
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <p className="text-sm font-medium">
                                                                Adreca {addressIndex + 1}
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (
                                                                        currentAddresses.length ===
                                                                        1
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    const nextAddresses =
                                                                        currentAddresses.filter(
                                                                            (_, index) =>
                                                                                index !==
                                                                                addressIndex,
                                                                        );

                                                                    if (
                                                                        !nextAddresses.some(
                                                                            (
                                                                                currentAddress,
                                                                            ) =>
                                                                                currentAddress.is_primary,
                                                                        )
                                                                    ) {
                                                                        nextAddresses[0] = {
                                                                            ...nextAddresses[0],
                                                                            is_primary: true,
                                                                        };
                                                                    }

                                                                    updateAddresses(
                                                                        nextAddresses,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    currentAddresses.length === 1
                                                                }
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </div>

                                                        <div className="grid gap-3 md:grid-cols-3">
                                                            <div className="grid gap-2">
                                                                <Label>
                                                                    Tipus d'adreca
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        address.address_type
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            address_type:
                                                                                event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.address_type`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2 md:col-span-2">
                                                                <Label>Linia 1</Label>
                                                                <Input
                                                                    value={
                                                                        address.line_1
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            line_1:
                                                                                event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.line_1`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2 md:col-span-3">
                                                                <Label>Linia 2</Label>
                                                                <Input
                                                                    value={
                                                                        address.line_2 ??
                                                                        ''
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            line_2:
                                                                                event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.line_2`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>Ciutat</Label>
                                                                <Input
                                                                    value={
                                                                        address.city
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            city: event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.city`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>Provincia</Label>
                                                                <Input
                                                                    value={
                                                                        address.state ??
                                                                        ''
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            state: event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.state`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>Codi postal</Label>
                                                                <Input
                                                                    value={
                                                                        address.postal_code ??
                                                                        ''
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            postal_code:
                                                                                event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.postal_code`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>Pais (ISO-2)</Label>
                                                                <Input
                                                                    value={
                                                                        address.country_code
                                                                    }
                                                                    onChange={(event) => {
                                                                        const nextAddresses =
                                                                            [...currentAddresses];
                                                                        nextAddresses[
                                                                            addressIndex
                                                                        ] = {
                                                                            ...nextAddresses[
                                                                                addressIndex
                                                                            ],
                                                                            country_code:
                                                                                event.target.value,
                                                                        };
                                                                        updateAddresses(
                                                                            nextAddresses,
                                                                        );
                                                                    }}
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `addresses.${addressIndex}.country_code`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2 md:col-span-2">
                                                                <input
                                                                    id={`primary-address-${addressIndex}`}
                                                                    type="radio"
                                                                    checked={
                                                                        address.is_primary
                                                                    }
                                                                    onChange={() =>
                                                                        setPrimaryAddress(
                                                                            addressIndex,
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`primary-address-${addressIndex}`}
                                                                >
                                                                    Adreca principal
                                                                </Label>
                                                                <input
                                                                    type="hidden"
                                                                    value={
                                                                        address.is_primary
                                                                            ? '1'
                                                                            : '0'
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button disabled={processing}>
                                            {processing
                                                ? 'Guardant...'
                                                : editingBusinessPartner
                                                  ? 'Actualitzar Business Partner'
                                                  : 'Crear Business Partner'}
                                        </Button>

                                        {editingBusinessPartner && (
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
                            );
                        })()}
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Codi</th>
                                <th className="px-4 py-3 font-medium">Tipus</th>
                                <th className="px-4 py-3 font-medium">Nom</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Adreces</th>
                                <th className="px-4 py-3 font-medium">Accions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businessPartners.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Encara no hi ha Business Partners.
                                    </td>
                                </tr>
                            )}

                            {businessPartners.map((businessPartner) => (
                                <tr key={businessPartner.id} className="border-t">
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {businessPartner.code}
                                    </td>
                                    <td className="px-4 py-3">
                                        {businessPartner.type}
                                    </td>
                                    <td className="px-4 py-3">
                                        {businessPartner.type === 'company'
                                            ? businessPartner.company_name
                                            : `${businessPartner.first_name} ${businessPartner.last_name}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        {businessPartner.email ?? '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {businessPartner.addresses.length}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingBusinessPartner(
                                                        businessPartner,
                                                    );
                                                    hydrateForm(businessPartner);
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        businessPartner,
                                                    )
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

BusinessPartnersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Business Partners',
            href: businessPartnersIndex(),
        },
    ],
};
