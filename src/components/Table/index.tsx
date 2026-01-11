import React, { useState, useEffect } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchData } from '../../api'; //
import type {Data} from '../../types/index.types.ts';
import styles from './style.module.scss';

export const Index: React.FC = () => {
    const [data, setData] = useState<Data[]>([]);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows] = useState(12);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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

    return (
        <div className={styles.page}>
            <div className={styles.tableHeader}>
                <div className={styles.selectionCounter}>
                    <span>
                        {`Selected: ${selectedIds.size} rows${selectedIds.size > 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>

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
                <Column field="title" header="Title" className={styles.title} />
                <Column field="place_of_origin" header="Place of Origin" className={styles.place} />
                <Column field="artist_display" header="Artist" className={styles.artist} />
                <Column field="inscriptions" header="Inscriptions" className={styles.ins} />
                <Column field="date_start" header="Date Start" className={styles.dateStart} />
                <Column field="date_end" header="Date End" className={styles.dateEnd} />
            </DataTable>
        </div>
    );
};