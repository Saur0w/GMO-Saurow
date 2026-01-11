import React, { useState, useEffect, useRef } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { fetchData } from '../../api';
import type { Data } from '../../types/index.types';
import styles from './style.module.scss';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export const Index: React.FC = () => {
    const [data, setData] = useState<Data[]>([]);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows] = useState(12);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectCount, setSelectCount] = useState('');
    const overlayRef = useRef<OverlayPanel>(null);

    const currentPage = Math.floor(first / rows) + 1;

    const loadData = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetchData(page);
            setData(response.data);
            setTotalRecords(response.pagination.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(currentPage);
    }, [currentPage]);

    const onPageChange = (event: DataTablePageEvent) => {
        setFirst(event.first);
    };

    const onSelectionChange = (e: { value: Data[] }) => {
        const selectedRows = e.value;
        const newSelectedIds = new Set(selectedIds);

        data.forEach(item => {
            newSelectedIds.delete(item.id);
        });

        selectedRows.forEach(row => {
            newSelectedIds.add(row.id);
        });

        setSelectedIds(newSelectedIds);
    };

    const getSelectedRows = () => {
        return data.filter(item => selectedIds.has(item.id));
    };

    const handleCustomSelection = () => {
        const count = parseInt(selectCount);

        if (!count || count <= 0) {
            alert('Please enter a valid number');
            return;
        }

        if (count > totalRecords) {
            alert(`Maximum available rows: ${totalRecords}`);
            return;
        }

        const newSelectedIds = new Set<number>();
        const rowsToSelectOnCurrentPage = Math.min(count, data.length);
        for (let i = 0; i < rowsToSelectOnCurrentPage; i++) {
            if (data[i]) {
                newSelectedIds.add(data[i].id);
            }
        }

        sessionStorage.setItem('selectionCount', count.toString());
        sessionStorage.setItem('selectionActive', 'true');

        setSelectedIds(newSelectedIds);
        overlayRef.current?.hide();
        setSelectCount('');
    };

    useEffect(() => {
        const selectionActive = sessionStorage.getItem('selectionActive');
        const selectionCount = sessionStorage.getItem('selectionCount');

        if (selectionActive === 'true' && selectionCount && data.length > 0) {
            const count = parseInt(selectionCount);
            const pageStartIndex = (currentPage - 1) * rows;
            const newSelectedIds = new Set(selectedIds);

            data.forEach((item, index) => {
                const absoluteIndex = pageStartIndex + index;
                if (absoluteIndex < count) {
                    newSelectedIds.add(item.id);
                }
            });

            setSelectedIds(newSelectedIds);
        }
    }, [data, currentPage]);

    const formatValue = (value: string | number | null | undefined): string => {
        return value?.toString() ?? 'N/A';
    };

    const renderHeader = () => (
        <div className={styles.tableHeader}>
            <div className={styles.selectionCounter}>
                <span>
                    Selected: {selectedIds.size} row{selectedIds.size !== 1 ? 's' : ''}
                </span>
            </div>
            <Button
                icon="pi pi-angle-down"
                className="p-button-text p-button-plain"
                onClick={(e) => overlayRef.current?.toggle(e)}
                style={{ marginLeft: 'auto' }}
            />
            <OverlayPanel ref={overlayRef}>
                <div style={{ padding: '1rem', minWidth: '280px' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px' }}>
                        Select Rows
                    </h4>
                    <div style={{ marginBottom: '1rem' }}>
                        <InputText
                            value={selectCount}
                            onChange={(e) => setSelectCount(e.target.value)}
                            placeholder="Enter number of rows"
                            type="number"
                            min="1"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <Button
                        label="Submit"
                        onClick={handleCustomSelection}
                        style={{ width: '100%' }}
                    />
                </div>
            </OverlayPanel>
        </div>
    );

    return (
        <div className={styles.page}>
            {renderHeader()}

            <DataTable
                value={data}
                lazy
                paginator
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                onPage={onPageChange}
                loading={loading}
                dataKey="id"
                selection={getSelectedRows()}
                onSelectionChange={onSelectionChange}
                selectionMode="checkbox"
                tableStyle={{ minWidth: '50rem' }}
                paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
                <Column selectionMode="multiple" className={styles.selection} />
                <Column
                    field="title"
                    header="Title"
                    className={styles.title}
                    body={(rowData) => formatValue(rowData.title)}
                />
                <Column
                    field="place_of_origin"
                    header="Place of Origin"
                    className={styles.place}
                    body={(rowData) => formatValue(rowData.place_of_origin)}
                />
                <Column
                    field="artist_display"
                    header="Artist"
                    className={styles.artist}
                    body={(rowData) => formatValue(rowData.artist_display)}
                />
                <Column
                    field="inscriptions"
                    header="Inscriptions"
                    className={styles.ins}
                    body={(rowData) => formatValue(rowData.inscriptions)}
                />
                <Column
                    field="date_start"
                    header="Date Start"
                    className={styles.dateStart}
                    body={(rowData) => formatValue(rowData.date_start)}
                />
                <Column
                    field="date_end"
                    header="Date End"
                    className={styles.dateEnd}
                    body={(rowData) => formatValue(rowData.date_end)}
                />
            </DataTable>
        </div>
    );
};