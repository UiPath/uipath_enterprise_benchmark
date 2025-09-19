// SAP Stock Overview - Data Model and Sample Data
// ============================================================================

export interface Material {
  id: string;
  description: string;
  type: string;
  typeDescription: string;
  baseUnit: string;
  status: string;
}

export interface StockData {
  unrestricted?: number;
  qualityInspection?: number;
  reserved?: number;
  rcptReservation?: number;
  onOrder?: number;
  consgtOrdered?: number;
  stockTransfer?: number;
  consignment?: number;
}

export interface SpecialStock {
  [key: string]: StockData;
}

export interface StorageLocation extends StockData {
  name: string;
  specialStock?: SpecialStock;
}

export interface Plant extends StockData {
  name: string;
  storageLocations?: { [key: string]: StorageLocation };
}

export interface Organization extends StockData {
  name: string;
  type: 'company';
  plants?: { [key: string]: Plant };
}

export interface MaterialStockData {
  full: StockData;
  organizations: { [key: string]: Organization };
}

export interface Plant {
  code: string;
  name: string;
  company: string;
}

export interface FormData {
  material: string;
  plant: string;
  storageLocation: string;
  batch: string;
  specialStocks: boolean;
  stockCommitments: boolean;
}

export interface DisplayLevels {
  companyCode: boolean;
  plant: boolean;
  storageLocation: boolean;
  batch: boolean;
  specialStock: boolean;
}

export interface ViewState {
  currentView: 'menu' | 'stock' | 'results' | 'submit';
  viewHistory: string[];
  expandedNodes: { [key: string]: boolean };
  formData: FormData;
  displayLevels: DisplayLevels;
  submitResults: string;
  transactionCode: string;
  showHelp: boolean;
  showModal: boolean;
  modalContent: { title: string; message: string };
}

// Sample Materials Data
export const SAMPLE_MATERIALS: Material[] = [
  // Original sample materials
  {
    id: '1287',
    description: 'Steel Pipe Assembly',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'KG',
    status: 'Active'
  },
  {
    id: '100-210',
    description: 'Automotive Engine Block',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: '200000054',
    description: 'Raw Steel Material',
    type: 'ROH',
    typeDescription: 'Raw material',
    baseUnit: 'KG',
    status: 'Active'
  },
  {
    id: '300-400',
    description: 'Electronic Control Unit',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  
  // Extended SAP material data
  {
    id: 'SG011',
    description: 'CONTROL BOARD',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG1_CP',
    description: 'FG1_CP, SHAFT WITH ROLLING BEARINGS',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG2_CP',
    description: 'CP-FG2, INK BOTTLED,15 ML',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'L',
    status: 'Active'
  },
  {
    id: 'SG1_CP',
    description: 'CP-SG1, SHAFT',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG2_CP',
    description: 'CP-SG2, INK BOTTLED',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'L',
    status: 'Active'
  },
  {
    id: 'FG011',
    description: 'ELECTRIC FAN',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG013',
    description: 'FAN BLADE',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG014',
    description: 'FAN STAND ASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG233',
    description: 'FERT 233, PD, REPETITIVE MANUF.',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'F-10A',
    description: 'FIN10A,MTS-DDMRP,PD',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'F-10B',
    description: 'FIN10B,MTS-DDMRP,PD',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG126',
    description: 'FIN126,MTS-DI,PD,SERIALNO',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG129',
    description: 'FIN129,MTS-DI,PD,QM',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG130',
    description: 'FIN130,MTS-DI,PD,PP',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'F-20A',
    description: 'FIN20A,MTS-DDMRP,PD',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG228',
    description: 'FIN228,MTO,PD,FIFO',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG29-1',
    description: 'FIN29-1,MTS-PI, WITH SILO MATERIAL',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'KG',
    status: 'Active'
  },
  {
    id: 'FG29',
    description: 'FIN29,MTS-PI,PD,BATCH-EXPIRATIONDATE',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'FG6200',
    description: 'FIN6200, MTO-PI, PD, BATCH',
    type: 'FERT',
    typeDescription: 'Finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SGPI001-V00',
    description: 'OUTPUT 1',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'QM006',
    description: 'QM PRODUCTION BATCH',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SDBOMERLAHD',
    description: 'SD BOM HEADER ERLA',
    type: 'KMAT',
    typeDescription: 'Configurable material',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SDBOMLUMFHD',
    description: 'SD BOM HEADER LUMF',
    type: 'KMAT',
    typeDescription: 'Configurable material',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG29',
    description: 'SEM29,PD,QM',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG30',
    description: 'SEM30,PD,PP',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-310',
    description: 'SEM310,MTS,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-315',
    description: 'SEM315,MTS,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG1010',
    description: 'SEMI1010, PD, SILO MATERIAL WITH BATCH',
    type: 'ROH',
    typeDescription: 'Raw material',
    baseUnit: 'KG',
    status: 'Active'
  },
  {
    id: 'SG124',
    description: 'SEMI124,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-201',
    description: 'SEMI201,MTS,D1,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-208',
    description: 'SEMI208,MTS,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG21',
    description: 'SEMI21,PD,REPETITIVEMANUF.',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-210',
    description: 'SEMI210,MTS,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG22',
    description: 'SEMI22,PD,PHANTOM',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG2200',
    description: 'SEMI2200,MTS-PI,PD,WITH CO- & BY-PRODUCT',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG224',
    description: 'SEMI224,MTO,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG23',
    description: 'SEMI23,PD,SUBCONTRACTING',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG233',
    description: 'SEMI233,PD,KANBAN, REM',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG234',
    description: 'SEMI234,PD,KANBAN, MTS',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG24',
    description: 'SEMI24,PD,BATCH-FIFO',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG26',
    description: 'SEMI26,PD,SUBCONTRACTING',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG27',
    description: 'SEMI27,PD,SUBCONTRACTING',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'S-301',
    description: 'SEMI301,MTS,PD,SUBASSEMBLY',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG6100',
    description: 'SEMI6100, PI, PD, BATCH',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SG022',
    description: 'SENSOR MODULE',
    type: 'HALB',
    typeDescription: 'Semi-finished product',
    baseUnit: 'PC',
    status: 'Active'
  },
  {
    id: 'SRV_BOM_10_01',
    description: 'SERVICE PRODUCT WITH BOM 10_01',
    type: 'DIEN',
    typeDescription: 'Service',
    baseUnit: 'AU',
    status: 'Active'
  }
];

// Sample Stock Data
export const SAMPLE_STOCK_DATA: { [key: string]: MaterialStockData } = {
  '1287': {
    full: {
      unrestricted: 224000,
      qualityInspection: 3000,
      reserved: 0,
      onOrder: 180000,
      consignment: 9000
    },
    organizations: {
      '1000': {
        name: 'IDES AG',
        type: 'company',
        unrestricted: 150000,
        plants: {
          '1100': {
            name: 'Berlin',
            unrestricted: 150000,
            storageLocations: {
              '0001': { name: 'Auslief.Lager', unrestricted: 150000 }
            }
          }
        }
      },
      'T100': {
        name: 'TATA MOTORS',
        type: 'company',
        unrestricted: 74000,
        qualityInspection: 3000,
        onOrder: 180000,
        plants: {
          'T110': {
            name: 'PLANT GURGAON',
            unrestricted: 74000,
            qualityInspection: 3000,
            onOrder: 180000,
            storageLocations: {
              'T001': { 
                name: 'RAW MATERIAL', 
                unrestricted: 14000, 
                onOrder: 100000 
              },
              'WMS1': { 
                name: 'WAREHOUSE 1', 
                unrestricted: 60000, 
                qualityInspection: 3000, 
                onOrder: 80000,
                specialStock: {
                  'Vendor Consignment': { unrestricted: 9000 }
                }
              }
            }
          }
        }
      }
    }
  },
  '100-210': {
    full: {
      unrestricted: 45000,
      reserved: 1200,
      onOrder: 25000
    },
    organizations: {
      'T100': {
        name: 'TATA MOTORS',
        type: 'company',
        unrestricted: 45000,
        reserved: 1200,
        onOrder: 25000,
        plants: {
          'T110': {
            name: 'PLANT GURGAON',
            unrestricted: 45000,
            reserved: 1200,
            onOrder: 25000,
            storageLocations: {
              'FG01': { name: 'FINISHED GOODS', unrestricted: 45000, reserved: 1200, onOrder: 25000 }
            }
          }
        }
      }
    }
  },
  
  // Electronics Component - SG011 (CONTROL BOARD)
  'SG011': {
    full: {
      unrestricted: 85000,
      qualityInspection: 2500,
      reserved: 1800,
      onOrder: 45000,
      consignment: 3500
    },
    organizations: {
      'S000': {
        name: 'SIEMENS AG',
        type: 'company',
        unrestricted: 45000,
        qualityInspection: 1500,
        reserved: 800,
        onOrder: 25000,
        plants: {
          'S100': {
            name: 'SIEMENS ERLANGEN',
            unrestricted: 30000,
            qualityInspection: 1000,
            onOrder: 15000,
            storageLocations: {
              'E001': { name: 'ELECTRONICS WAREHOUSE', unrestricted: 25000, qualityInspection: 800, onOrder: 12000 },
              'Q001': { name: 'QUALITY CONTROL', unrestricted: 5000, qualityInspection: 200, onOrder: 3000 }
            }
          },
          'S200': {
            name: 'SIEMENS NUREMBERG', 
            unrestricted: 15000,
            qualityInspection: 500,
            reserved: 800,
            onOrder: 10000,
            storageLocations: {
              'P001': { name: 'PRODUCTION STORE', unrestricted: 15000, qualityInspection: 500, reserved: 800, onOrder: 10000 }
            }
          }
        }
      },
      'K000': {
        name: 'SAMSUNG ELECTRONICS',
        type: 'company',
        unrestricted: 25000,
        qualityInspection: 800,
        reserved: 600,
        onOrder: 15000,
        consignment: 2000,
        plants: {
          'K100': {
            name: 'SAMSUNG SEOUL',
            unrestricted: 18000,
            qualityInspection: 600,
            reserved: 400,
            onOrder: 10000,
            storageLocations: {
              'M001': { name: 'MAIN WAREHOUSE', unrestricted: 12000, qualityInspection: 400, onOrder: 7000 },
              'A001': { name: 'ASSEMBLY LINE', unrestricted: 6000, qualityInspection: 200, reserved: 400, onOrder: 3000 }
            }
          },
          'K200': {
            name: 'SAMSUNG SUWON',
            unrestricted: 7000,
            qualityInspection: 200,
            reserved: 200,
            onOrder: 5000,
            consignment: 2000,
            storageLocations: {
              'R001': { name: 'R&D STORAGE', unrestricted: 7000, qualityInspection: 200, reserved: 200, onOrder: 5000 },
              'C001': { name: 'CONSIGNMENT', consignment: 2000 }
            }
          }
        }
      }
    }
  },

  // Automotive Component - FG1_CP (SHAFT WITH ROLLING BEARINGS)
  'FG1_CP': {
    full: {
      unrestricted: 12500,
      qualityInspection: 800,
      reserved: 2200,
      onOrder: 8000,
      stockTransfer: 500
    },
    organizations: {
      'T100': {
        name: 'TATA MOTORS',
        type: 'company',
        unrestricted: 8000,
        qualityInspection: 500,
        reserved: 1500,
        onOrder: 5000,
        plants: {
          'T130': {
            name: 'PLANT JAMSHEDPUR',
            unrestricted: 8000,
            qualityInspection: 500,
            reserved: 1500,
            onOrder: 5000,
            storageLocations: {
              'AUTO1': { name: 'AUTOMOTIVE PARTS', unrestricted: 5500, qualityInspection: 300, reserved: 1000, onOrder: 3500 },
              'QC01': { name: 'QUALITY CHECK', unrestricted: 2500, qualityInspection: 200, reserved: 500, onOrder: 1500 }
            }
          }
        }
      },
      'J000': {
        name: 'TOYOTA MOTOR',
        type: 'company',
        unrestricted: 4500,
        qualityInspection: 300,
        reserved: 700,
        onOrder: 3000,
        stockTransfer: 500,
        plants: {
          'J100': {
            name: 'TOYOTA TOYOTA CITY',
            unrestricted: 3000,
            qualityInspection: 200,
            reserved: 500,
            onOrder: 2000,
            storageLocations: {
              'TC01': { name: 'TOYOTA COMPONENTS', unrestricted: 3000, qualityInspection: 200, reserved: 500, onOrder: 2000 }
            }
          },
          'J200': {
            name: 'TOYOTA GEORGETOWN',
            unrestricted: 1500,
            qualityInspection: 100,
            reserved: 200,
            onOrder: 1000,
            stockTransfer: 500,
            storageLocations: {
              'US01': { name: 'US ASSEMBLY', unrestricted: 1500, qualityInspection: 100, reserved: 200, onOrder: 1000, stockTransfer: 500 }
            }
          }
        }
      }
    }
  },

  // Chemical Material - 200000054 (Raw Steel Material)
  '200000054': {
    full: {
      unrestricted: 550000,
      qualityInspection: 15000,
      reserved: 8500,
      onOrder: 350000,
      consignment: 25000
    },
    organizations: {
      'B000': {
        name: 'BASF SE',
        type: 'company',
        unrestricted: 180000,
        qualityInspection: 8000,
        reserved: 3500,
        onOrder: 120000,
        consignment: 15000,
        plants: {
          'B100': {
            name: 'BASF LUDWIGSHAFEN',
            unrestricted: 120000,
            qualityInspection: 5000,
            reserved: 2000,
            onOrder: 80000,
            storageLocations: {
              'CH01': { name: 'CHEMICAL STORAGE', unrestricted: 80000, qualityInspection: 3000, onOrder: 50000 },
              'RAW1': { name: 'RAW MATERIALS', unrestricted: 40000, qualityInspection: 2000, reserved: 2000, onOrder: 30000 }
            }
          },
          'B200': {
            name: 'BASF ANTWERP',
            unrestricted: 60000,
            qualityInspection: 3000,
            reserved: 1500,
            onOrder: 40000,
            consignment: 15000,
            storageLocations: {
              'BE01': { name: 'BELGIUM FACILITY', unrestricted: 60000, qualityInspection: 3000, reserved: 1500, onOrder: 40000 },
              'CONS1': { name: 'CONSIGNMENT STOCK', consignment: 15000 }
            }
          }
        }
      },
      'T100': {
        name: 'TATA MOTORS',
        type: 'company',
        unrestricted: 120000,
        qualityInspection: 4000,
        reserved: 2500,
        onOrder: 80000,
        plants: {
          'T130': {
            name: 'PLANT JAMSHEDPUR',
            unrestricted: 120000,
            qualityInspection: 4000,
            reserved: 2500,
            onOrder: 80000,
            storageLocations: {
              'ST01': { name: 'STEEL STORAGE', unrestricted: 100000, qualityInspection: 3500, reserved: 2000, onOrder: 70000 },
              'PR01': { name: 'PRODUCTION READY', unrestricted: 20000, qualityInspection: 500, reserved: 500, onOrder: 10000 }
            }
          }
        }
      }
    }
  },

  // Food Ingredient - FG233 (FERT 233, PD, REPETITIVE MANUF.)
  'FG233': {
    full: {
      unrestricted: 95000,
      qualityInspection: 3200,
      reserved: 1800,
      onOrder: 60000,
      rcptReservation: 2500
    },
    organizations: {
      'N000': {
        name: 'NESTLE SA',
        type: 'company',
        unrestricted: 65000,
        qualityInspection: 2200,
        reserved: 1200,
        onOrder: 40000,
        rcptReservation: 1800,
        plants: {
          'N100': {
            name: 'NESTLE VEVEY',
            unrestricted: 40000,
            qualityInspection: 1500,
            reserved: 800,
            onOrder: 25000,
            storageLocations: {
              'FD01': { name: 'FOOD INGREDIENTS', unrestricted: 30000, qualityInspection: 1000, onOrder: 20000 },
              'QA01': { name: 'QUALITY ASSURANCE', unrestricted: 10000, qualityInspection: 500, reserved: 800, onOrder: 5000 }
            }
          },
          'N200': {
            name: 'NESTLE MAGGI',
            unrestricted: 25000,
            qualityInspection: 700,
            reserved: 400,
            onOrder: 15000,
            rcptReservation: 1800,
            storageLocations: {
              'MG01': { name: 'MAGGI PRODUCTION', unrestricted: 25000, qualityInspection: 700, reserved: 400, onOrder: 15000, rcptReservation: 1800 }
            }
          }
        }
      }
    }
  }
};

// Sample Plants Data
export const SAMPLE_PLANTS: Plant[] = [
  // IDES AG (German multinational)
  { code: '1100', name: 'Berlin', company: '1000' },
  { code: '1200', name: 'Hamburg', company: '1000' },
  { code: '1300', name: 'Munich', company: '1000' },
  
  // TATA MOTORS (Indian automotive)
  { code: 'T110', name: 'PLANT GURGAON', company: 'T100' },
  { code: 'T120', name: 'PLANT PUNE', company: 'T100' },
  { code: 'T130', name: 'PLANT JAMSHEDPUR', company: 'T100' },
  
  // SIEMENS AG (German technology)
  { code: 'S100', name: 'SIEMENS ERLANGEN', company: 'S000' },
  { code: 'S200', name: 'SIEMENS NUREMBERG', company: 'S000' },
  { code: 'S300', name: 'SIEMENS ATLANTA', company: 'S000' },
  
  // SAMSUNG ELECTRONICS (Korean technology)
  { code: 'K100', name: 'SAMSUNG SEOUL', company: 'K000' },
  { code: 'K200', name: 'SAMSUNG SUWON', company: 'K000' },
  { code: 'K300', name: 'SAMSUNG AUSTIN', company: 'K000' },
  
  // BASF SE (German chemicals)
  { code: 'B100', name: 'BASF LUDWIGSHAFEN', company: 'B000' },
  { code: 'B200', name: 'BASF ANTWERP', company: 'B000' },
  { code: 'B300', name: 'BASF FREEPORT', company: 'B000' },
  
  // NESTLE SA (Swiss food & beverage)
  { code: 'N100', name: 'NESTLE VEVEY', company: 'N000' },
  { code: 'N200', name: 'NESTLE MAGGI', company: 'N000' },
  { code: 'N300', name: 'NESTLE YORK', company: 'N000' },
  
  // TOYOTA MOTOR (Japanese automotive)
  { code: 'J100', name: 'TOYOTA TOYOTA CITY', company: 'J000' },
  { code: 'J200', name: 'TOYOTA GEORGETOWN', company: 'J000' },
  { code: 'J300', name: 'TOYOTA VALENCIENNES', company: 'J000' }
];

// SAP Menu Structure
export const SAP_MENU_STRUCTURE = [
  {
    id: 'office',
    name: 'Office',
    hasSubmenu: false
  },
  {
    id: 'cross-app',
    name: 'Cross-Application Components',
    hasSubmenu: false
  },
  {
    id: 'collaboration',
    name: 'Collaboration Projects',
    hasSubmenu: false
  },
  {
    id: 'logistics',
    name: 'Logistics',
    hasSubmenu: true,
    children: [
      {
        id: 'materials-management',
        name: 'Materials Management',
        hasSubmenu: true,
        children: [
          {
            id: 'inventory-management',
            name: 'Inventory Management',
            hasSubmenu: true,
            children: [
              {
                id: 'stock-overview',
                name: 'Stock Overview',
                transaction: 'MMBE',
                hasSubmenu: false
              },
              {
                id: 'material-display',
                name: 'Material Display',
                transaction: 'MM03',
                hasSubmenu: false
              },
              {
                id: 'plant-overview',
                name: 'Plant Overview',
                hasSubmenu: false
              }
            ]
          },
          {
            id: 'purchasing',
            name: 'Purchasing',
            hasSubmenu: true,
            children: [
              {
                id: 'create-po',
                name: 'Create Purchase Order',
                transaction: 'ME21N',
                hasSubmenu: false
              }
            ]
          },
          {
            id: 'warehouse-management',
            name: 'Warehouse Management',
            hasSubmenu: false
          }
        ]
      },
      {
        id: 'sales-distribution',
        name: 'Sales and Distribution',
        hasSubmenu: false
      },
      {
        id: 'production-planning',
        name: 'Production Planning',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'accounting',
    name: 'Accounting',
    hasSubmenu: false
  },
  {
    id: 'hr',
    name: 'Human Resources',
    hasSubmenu: false
  },
  {
    id: 'info-systems',
    name: 'Information Systems',
    hasSubmenu: false
  },
  {
    id: 'tools',
    name: 'Tools',
    hasSubmenu: false
  }
];

// Stock Display Columns Configuration
export const STOCK_COLUMNS = ['unrestricted', 'qualityInspection', 'reserved', 'rcptReservation', 'onOrder', 'consgtOrdered', 'stockTransfer'];
export const COLUMN_HEADERS = ['Unrestricted use', 'Qual. inspection', 'Reserved', 'Rcpt reservation', 'On-Order Stock', 'Consgt ordered', 'Stck trans.(pl...)'];

// Initial Form Data
export const getInitialFormData = (): FormData => ({
  material: '',
  plant: '',
  storageLocation: '',
  batch: '',
  specialStocks: true,
  stockCommitments: true
});

// Initial Display Levels
export const getInitialDisplayLevels = (): DisplayLevels => ({
  companyCode: true,
  plant: true,
  storageLocation: true,
  batch: true,
  specialStock: true
});

// Helper Functions
export const getMaterialById = (id: string): Material | undefined => {
  return SAMPLE_MATERIALS.find(m => m.id === id);
};

export const getStockDataByMaterial = (materialId: string): MaterialStockData => {
  return SAMPLE_STOCK_DATA[materialId] || { full: {}, organizations: {} };
};
