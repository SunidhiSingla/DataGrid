"use client";
import { AgGridReact } from 'ag-grid-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { AllCommunityModule, ModuleRegistry, GridReadyEvent, ColDef } from 'ag-grid-community';
import data from '../../sample-applications.json';
import { useQueryStates } from 'nuqs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Type definitions
interface Skill {
  id: string;
  name: string;
  years: string;
}

interface Candidate {
  id: string;
  userId: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ctc: string;
  employer: string;
  currentContractType: string | null;
  currentWorkType: string | null;
  preferredWorkType: string;
  matchPercentage: number;
  offerCTC: string | number;
  offersInHand: string;
  overallExperience: string;
  willingToRelocate: boolean;
  expectedCTC: string;
  noticePeriod: string;
  applicationStatus: string;
  attachmentFileExtension: string;
  createdAt: string;
  skills: Skill[];
}

interface ProcessedCandidate {
  candidateId: string;
  userId: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  ctc: string;
  employer: string;
  currentContractType: string | null;
  currentWorkType: string | null;
  preferredWorkType: string;
  matchPercentage: number;
  offerCTC: string | number;
  offersInHand: string;
  overallExperience: string;
  willingToRelocate: boolean;
  expectedCTC: string;
  noticePeriod: string;
  applicationStatus: string;
  attachmentFileExtension: string;
  createdAt: string;
  [key: string]: string | number | boolean | null; // For dynamic skill columns
}

interface QueryParams {
  page: number;
  filters: string;
  search: string;
  rows: number;
  sort: string;
}

interface SortModel {
  colId: string;
  sort: string;
}

const Page = () => {
  // Grid API reference
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<any>(null);
  
  // State for all available columns and which ones are visible
  const [allColumns, setAllColumns] = useState<ColDef[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<ColDef[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const getUniqueSkillNames = (): string[] => {
    const skillNames = new Set<string>();
    
    (data as Candidate[]).forEach(candidate => {
      candidate.skills.forEach(skill => {
        skillNames.add(skill.name);
      });
    });
    
    return Array.from(skillNames);
  };

  const [{ page, filters, search, rows, sort }, setParams] = useQueryStates({
    page: {
      defaultValue: 1,
      parse: (value: string) => parseInt(value) || 1,
    },
    filters: {
      defaultValue: '',
      parse: (value) => value || '',
    },
    search: {
      defaultValue: '',
      parse: (value: string) => value || '',
    },
    rows: {
      defaultValue: 20,
      parse: (value: string) => parseInt(value) || 20,
    },
    sort: {
      defaultValue: '',
      parse: (value: string) => value || '',
    }
  }, {
    history: 'push',
    throttleMs: 300 // Reduced throttle time for more responsive updates
  });

  // Keep a local state of page size to force re-render when it changes
  const [pageSize, setPageSize] = useState<number>(rows || 20);

  // Update local page size when URL parameter changes
  useEffect(() => {
    if (rows && typeof rows === 'number') {
      setPageSize(rows);
    }
  }, [rows]);

  const onFilterChanged = useCallback(() => {
    if (gridApi) {
      const filterModel = gridApi.getFilterModel();
      if (Object.keys(filterModel).length === 0) {
        setParams({ filters: '' });
      }
      else {
        setParams({ filters: JSON.stringify(filterModel) });
      }
    }
  }, [gridApi, setParams]);

  const onSortChanged = useCallback(() => {
    if (gridApi) {
      // This is a direct API call, not relying on an event parameter
      const sortState: SortModel[] = gridApi.getColumnState()
        .filter((column: any) => column.sort)
        .map((column: any) => ({
          colId: column.colId,
          sort: column.sort
        }));
      
      if (sortState.length === 0) {
        setParams({ sort: '' });
      } else {
        setParams({ sort: JSON.stringify(sortState) });
      }
    }
  }, [gridApi, setParams]);

  const processDataWithSkillColumns = (): ProcessedCandidate[] => {
    const uniqueSkillNames = getUniqueSkillNames();
    const result: ProcessedCandidate[] = [];
    
    (data as Candidate[]).forEach(candidate => {
      // Create a base candidate object without skills
      const baseCandidate: ProcessedCandidate = {
        candidateId: candidate.id,
        userId: candidate.userId,
        jobId: candidate.jobId,
        candidateName: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        ctc: candidate.ctc,
        employer: candidate.employer,
        currentContractType: candidate.currentContractType,
        currentWorkType: candidate.currentWorkType,
        preferredWorkType: candidate.preferredWorkType,
        matchPercentage: candidate.matchPercentage,
        offerCTC: candidate.offerCTC,
        offersInHand: candidate.offersInHand,
        overallExperience: candidate.overallExperience,
        willingToRelocate: candidate.willingToRelocate,
        expectedCTC: candidate.expectedCTC,
        noticePeriod: candidate.noticePeriod,
        applicationStatus: candidate.applicationStatus,
        attachmentFileExtension: candidate.attachmentFileExtension,
        createdAt: candidate.createdAt,
      };
      
      // Initialize all skills to 0 years
      const skillsObject: Record<string, string> = {};
      uniqueSkillNames.forEach(skillName => {
        skillsObject[`skill_${skillName.replace(/\s+/g, '_')}`] = "0";
      });
      
      // Update with actual skills
      candidate.skills.forEach(skill => {
        skillsObject[`skill_${skill.name.replace(/\s+/g, '_')}`] = skill.years;
      });
      
      // Create the final row by combining base candidate and skills
      result.push({
        ...baseCandidate,
        ...skillsObject
      });
    });
    
    return result;
  };
  
  // Process the data once
  const rowData: ProcessedCandidate[] = processDataWithSkillColumns();

  // Column Definitions: Defines the columns to be displayed.
  const getFilterType = (field: string): string => {
    const value = rowData[0]?.[field];
    if (typeof value === 'number') {
      return 'agNumberColumnFilter';
    } else if (value instanceof Date) {
      return 'agDateColumnFilter';
    } else {
      return 'agTextColumnFilter';
    }
  };

  // Generate all possible columns
  const generateAllColumns = useCallback((): ColDef[] => {
    if (rowData.length === 0) return [];
    
    return Object.keys(rowData[0] || {}).map((key) => {
      // Check if this is a skill column
      const isSkillColumn = key.startsWith('skill_');
      
      // For skill columns, create a nicer header name
      let headerName = key;
      if (isSkillColumn) {
        // Remove 'skill_' prefix and replace underscores with spaces
        headerName = key.substring(6).replace(/_/g, ' ');
        // Capitalize each word
        headerName = headerName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Add "Years" at the end
        headerName = `${headerName} (Years)`;
      } else {
        // For non-skill columns, use the standard formatting
        headerName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      }
      
      return {
        field: key,
        headerName: headerName,
        sortable: true,
        filter: getFilterType(key),
      };
    });
  },[rowData]);


  // Update visible columns based on visibility state
  useEffect(() => {
    if (Object.keys(columnVisibility).length === 0 || allColumns.length === 0) return;
    
    const currentVisibleColumns = allColumns.filter(col => 
      columnVisibility[col.field as string] !== false
    );
    
    setVisibleColumns(currentVisibleColumns);
  }, [columnVisibility, allColumns]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    
    // Initialize all possible columns
    const initialAllColumns = generateAllColumns();
    setAllColumns(initialAllColumns);
    
    // Initialize column visibility state - all visible by default
    const initialVisibility: Record<string, boolean> = {};
    initialAllColumns.forEach(col => {
      if (col.field) {
        initialVisibility[col.field] = true;
      }
    });
    setColumnVisibility(initialVisibility);
    
    // Set initial visible columns
    setVisibleColumns(initialAllColumns);
    
    // Apply filters from URL
    if (filters) {
      try {
        params.api.setFilterModel(JSON.parse(filters));
      } catch (e) {
        console.error("Failed to parse filters:", e);
      }
    }
    
    // Apply sort state from URL
    if (sort) {
      try {
        const sortModel = JSON.parse(sort) as SortModel[];
        
        params.api.applyColumnState({
          state: sortModel.map((item) => ({
            colId: item.colId,
            sort: item.sort
          })),
          defaultState: { sort: null }
        });
      } catch (e) {
        console.error("Failed to parse sort:", e);
      }
    }
    
    // Apply search state from URL
    if (search) {
      params.api.setGridOption("quickFilterText", search);
    }
    
    // Navigate to the correct page from URL
    if (page && typeof page === 'number') {
      params.api.paginationGoToPage(page - 1);
    }
    
    params.api.refreshCells({ force: true });
  }, [filters, generateAllColumns, page, search, sort]);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((field: string) => {
    setColumnVisibility(prev => {
      const newVisibility = { ...prev, [field]: !prev[field] };
      return newVisibility;
    });
  }, []);

  // Reset columns to default (all visible)
  const resetColumns = useCallback(() => {
    const resetVisibility: Record<string, boolean> = {};
    allColumns.forEach(col => {
      if (col.field) {
        resetVisibility[col.field] = true;
      }
    });
    setColumnVisibility(resetVisibility);
    setVisibleColumns(allColumns);
  }, [allColumns]);

  const exportToCsv = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: 'candidate-skills-export.csv'
      });
    } else {
      console.error("Grid API is not available.");
    }
  }, [gridApi]);

  // Use CSV export with Excel-friendly options
  const exportToExcel = useCallback(() => {
    if (gridApi) {
      // Configure CSV export with Excel-friendly options
      const params = {
        fileName: 'candidate-skills-export.csv',
        // Use semicolons as separators for better Excel compatibility
        columnSeparator: ';'
      };
      gridApi.exportDataAsCsv(params);
    } else {
      console.error("Grid API is not available.");
    }
  }, [gridApi]);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setParams({ search: searchValue });
    if (gridApi) {
      gridApi.setGridOption("quickFilterText", searchValue);
    }
  }, [gridApi, setParams]);

  const defaultCol: ColDef = {
    filter: true,
    floatingFilter: true,
    resizable: true,
    sortable: true,
    filterParams: {
      buttons: ['clear'],
      debounceMs: 200,
      suppressAndOrCondition: true
    }
  };

  const onPaginationChanged = useCallback(() => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const currentPageSize = gridApi.paginationGetPageSize();
    
      
      // Update local state if needed
      if (currentPageSize !== pageSize) {
        setPageSize(currentPageSize);
      }
      
      // Always update URL parameters
      setParams({ 
        page: currentPage,
        rows: currentPageSize
      });
    }
  }, [gridApi, setParams, pageSize]);

  // Force the sort state to update on component mount
  useEffect(() => {
    if (sort && gridApi) {
      try {
        const sortModel = JSON.parse(sort) as SortModel[];
        gridApi.applyColumnState({
          state: sortModel.map((item) => ({
            colId: item.colId,
            sort: item.sort
          })),
          defaultState: { sort: null }
        });
      } catch (e) {
        console.error("Failed to apply sort on mount:", e);
      }
    }
  }, [sort, gridApi]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Candidate Skills Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="w-24">Quick Filter:</Label>
              <Input 
                id="search"
                type="text" 
                placeholder="Filter..." 
                value={search} 
                onChange={onSearchChange}
                className="w-full max-w-md"
              />
            </div>
            
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Show/Hide Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto">
                  {allColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.field as string}
                      checked={columnVisibility[column.field as string] !== false}
                      onCheckedChange={() => toggleColumnVisibility(column.field as string)}
                    >
                      {column.headerName || column.field}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={resetColumns} variant="outline">Reset Columns</Button>
              <Button onClick={exportToCsv} variant="outline">Export to CSV</Button>
              <Button onClick={exportToExcel} variant="outline">Export to Excel</Button>
            </div>
          </div>
          
          <div className="h-96 w-full">
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={visibleColumns}
              defaultColDef={defaultCol}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={pageSize}
              paginationPageSizeSelector={[20, 50, 100]}
              onPaginationChanged={onPaginationChanged}
              onFilterChanged={onFilterChanged}
              onSortChanged={onSortChanged}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;