import React, { useState, useEffect, useRef } from 'react';
import transportCompaniesData from './task-7-transport-companies.json';

interface TransportCompany {
  company_name: string;
  domain: string;
  modality: string;
  country: string;
  state: string;
  city: string;
  vehicle_types?: ('bus' | 'shuttle' | 'bicycle' | 'ship' | 'plane' | 'train')[];
  vehicles?: {
    type: 'bus' | 'shuttle' | 'bicycle' | 'ship' | 'plane' | 'train';
    image_name: string;
  }[];
  total_vehicles?: number;
}

interface Vehicle {
  id: string;
  type: 'bus' | 'shuttle' | 'bicycle' | 'ship' | 'plane' | 'train';
  image: string;
  name: string;
}

interface CompanyFleetData {
  name: string;
  location: string;
  bus_count: number;
  vehicles: Vehicle[];
  thumbnail: string;
}

type ViewMode = 'alphabet' | 'companies' | 'gallery';

const Task7: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('alphabet');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<TransportCompany | null>(null);
  const [visitedCompanies, setVisitedCompanies] = useState<Set<string>>(new Set());
  const [companyFleetCounts, setCompanyFleetCounts] = useState<Record<string, CompanyFleetData>>({});
  const [galleryImages, setGalleryImages] = useState<Vehicle[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const loggedCompaniesRef = useRef<Set<string>>(new Set());


  // Get precomputed vehicles for a company from JSON data
  const getCompanyVehicles = (companyName: string): Vehicle[] => {
    const company = (transportCompaniesData as TransportCompany[]).find(c => c.company_name === companyName);
    if (!company || !company.vehicles) {
      return [];
    }
    
    return company.vehicles.map((vehicle, index) => ({
      id: `${companyName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
      type: vehicle.type as 'bus' | 'shuttle' | 'bicycle' | 'ship' | 'plane' | 'train',
      image: `/images/transportation/${vehicle.image_name}`,
      name: `${vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} ${String.fromCharCode(65 + index)}`
    }));
  };

  // Get thumbnail image for company (first vehicle image)
  const getCompanyThumbnail = (company: TransportCompany): string => {
    const vehicles = getCompanyVehicles(company.company_name);
    return vehicles[0]?.image || '/images/transportation/089.jpg';
  };

  // Target companies that need to be visited for the task
  const targetCompanyNames = ['BERINI', 'AB Autonoleggio', 'ABBONDANTI', 'ABC BUS SERVICE'];
  
  // DETERMINISTIC VERIFICATION: These are the exact expected results for target companies
  // BERINI: 4 vehicles (2 buses, 2 shuttles) - Bus count: 2
  // AB Autonoleggio: 3 vehicles (3 shuttles) - Bus count: 0  
  // ABBONDANTI: 5 vehicles (5 buses) - Bus count: 5
  // ABC BUS SERVICE: 6 vehicles (3 buses, 3 shuttles) - Bus count: 3
  
  // Get A-C companies
  const getACCompanies = () => {
    return (transportCompaniesData as TransportCompany[]).filter(company => 
      /^[A-C]/i.test(company.company_name)
    );
  };


  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      visitedCompanies,
      companyFleetCounts
    };
  }, [visitedCompanies, companyFleetCounts]);

  // Verify deterministic behavior (run once on component mount)
  useEffect(() => {
    const verifyDeterministic = () => {
      console.log('[DETERMINISTIC TEST] Verifying consistent vehicle generation...');
      
      // Generate cheat results for A-C companies with buses (for testers)
      const acCompaniesWithBuses: Record<string, number> = {};
      const acCompanies = (transportCompaniesData as TransportCompany[]).filter(company => 
        /^[A-C]/i.test(company.company_name)
      );
      
      acCompanies.forEach(company => {
        const vehicles = getCompanyVehicles(company.company_name);
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        
        if (busCount > 0) {
          acCompaniesWithBuses[company.company_name] = busCount;
        }
      });
      
      console.log('[Cheat] Expected A-C companies with buses (for testers):', JSON.stringify(acCompaniesWithBuses, null, 2));
    };
    
    // Run verification once
    const hasVerified = (window as any).deterministicVerified;
    if (!hasVerified) {
      verifyDeterministic();
      (window as any).deterministicVerified = true;
    }
  }, []);
  

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Filter companies by selected letter
  const getCompaniesByLetter = (letter: string): TransportCompany[] => {
    return (transportCompaniesData as TransportCompany[]).filter((company: TransportCompany) =>
      company.company_name.charAt(0).toUpperCase() === letter.toUpperCase()
    );
  };

  // Get display companies for letter view (all companies are clickable)
  const getDisplayCompanies = (letter: string) => {
    const realCompanies = getCompaniesByLetter(letter);
    const displayCompanies: any[] = [];

    // Add all real companies from JSON (all clickable)
    realCompanies.forEach(company => {
      displayCompanies.push({
        displayName: company.company_name,
        location: `${company.city}, ${company.country}`,
        isTarget: false,
        company: company
      });
    });

    return displayCompanies;
  };

  // Generate JSON submission data (just returns what user submits)
  const generateSubmissionJSON = () => {
    const companies: Record<string, number> = {};
    Object.keys(companyFleetCounts).forEach(key => {
      const companyData = companyFleetCounts[key];
      companies[companyData.name] = companyData.bus_count;
    });

    return companies;
  };

  // Handle alphabet letter click
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentView('companies');
  };

  // Handle company click
  const handleCompanyClick = (companyDisplay: any) => {
    const company = companyDisplay.company;
    const companyKey = companyDisplay.displayName;
    
    setSelectedCompany({
      company_name: company.company_name,
      domain: 'land',
      modality: 'bus',
      country: company.country,
      state: company.state,
      city: company.city
    });

    // Generate vehicles for this company
    const vehicles = getCompanyVehicles(company.company_name);
    setGalleryImages(vehicles);
    setCurrentGalleryIndex(0);
    
    // Mark company as visited (only count target companies)
    const isTargetCompany = targetCompanyNames.some(target => company.company_name.includes(target));
    if (isTargetCompany) {
      setVisitedCompanies(prev => new Set([...prev, companyKey]));
    }
    
    // Count buses only (as per task requirements)
    const busCount = vehicles.filter(v => v.type === 'bus').length;
    const thumbnail = getCompanyThumbnail(company);
    
    if (isTargetCompany) {
      setCompanyFleetCounts(prev => ({
        ...prev,
        [companyKey]: {
          name: company.company_name,
          location: `${company.city}, ${company.country}`,
          bus_count: busCount,
          vehicles: vehicles,
          thumbnail: thumbnail
        }
      }));
    }

    setCurrentView('gallery');

    // Console log for human testers (single-run per company)
    if (isTargetCompany && !loggedCompaniesRef.current.has(companyKey)) {
      console.log(`[Cheat] Visited company: ${company.company_name} at ${company.city}, ${company.country}`);
      console.log(`[Cheat] Fleet: ${vehicles.length} total vehicles (${busCount} buses, ${vehicles.length - busCount} shuttles)`);
      console.log(`[Cheat] Bus count for JSON: ${busCount}`);
      console.log(`[Cheat] Progress: ${visitedCompanies.size + 1}/4 target companies visited`);
      loggedCompaniesRef.current.add(companyKey);
    }
  };

  // Handle navigation
  const handleBackToAlphabet = () => {
    setCurrentView('alphabet');
    setSelectedLetter('');
  };

  const handleBackToCompanies = () => {
    setCurrentView('companies');
    setSelectedCompany(null);
  };

  // Handle gallery navigation
  const handlePrevImage = () => {
    setCurrentGalleryIndex(prev => prev > 0 ? prev - 1 : galleryImages.length - 1);
  };

  const handleNextImage = () => {
    setCurrentGalleryIndex(prev => prev < galleryImages.length - 1 ? prev + 1 : 0);
  };

  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      visitedCompanies: Array.from(visitedCompanies),
      companyFleetCounts,
      totalTargetCompanies: 4,
      currentView,
      selectedLetter,
      selectedCompany,
      submissionData: generateSubmissionJSON()
    };
  }, [visitedCompanies, companyFleetCounts, currentView, selectedLetter, selectedCompany]);

  // Console log progress for human testers
  useEffect(() => {
    const visitedCount = visitedCompanies.size;
    const totalTarget = 4;
    
    if (visitedCount > 0 && visitedCount < totalTarget) {
      const progressKey = `task7_progress_${visitedCount}`;
      if (!(window as any)[progressKey]) {
        const remaining = totalTarget - visitedCount;
        console.log(`[Cheat] Progress: ${visitedCount}/${totalTarget} target companies visited`);
        console.log(`[Cheat] Need to visit ${remaining} more companies in letters A and B`);
        
        // Show which companies still need to be visited
        const remainingCompanies = targetCompanyNames.filter(name => 
          !Array.from(visitedCompanies).some(visited => visited.includes(name))
        );
        if (remainingCompanies.length > 0) {
          console.log(`[Cheat] Remaining companies to visit:`);
          remainingCompanies.slice(0, 3).forEach((name, index) => {
            console.log(`[Cheat] ${index + 1}. ${name} - Find in letters A or B`);
          });
        }
        
        (window as any)[progressKey] = true;
      }
    }
  }, [visitedCompanies]);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2c5aa0, #1e3a8a)',
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.8em', fontWeight: 'bold', letterSpacing: '2px' }}>TRANSPORTHUB</h1>
        <p style={{ margin: '12px 0 0 0', fontSize: '1.3em', opacity: 0.9 }}>
          European Transportation Company Directory
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '1em', opacity: 0.7 }}>
          Professional Fleet Management & Vehicle Galleries
        </p>
      </div>

      {/* Alphabet View */}
      {currentView === 'alphabet' && (
        <div>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#1e3a8a', 
            fontSize: '2em',
            marginBottom: '30px',
            fontWeight: '600'
          }}>
            TRANSPORT COMPANIES DIRECTORY
          </h2>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ color: '#374151', marginBottom: '25px', fontSize: '1.2em' }}>
              Browse companies alphabetically - Click a letter to view transport providers
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  style={{
                    width: '55px',
                    height: '55px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.4em',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h4 style={{ color: '#1f2937', fontSize: '1.3em', marginBottom: '15px' }}>
              🚌 Professional Transportation Directory
            </h4>
            <p style={{ color: '#6b7280', fontSize: '1.1em', lineHeight: '1.6', marginBottom: '20px' }}>
              Explore our comprehensive database of European transport companies. Each company profile includes detailed vehicle galleries, fleet information, and service specifications.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '25px', 
              flexWrap: 'wrap',
              marginTop: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚍</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Buses</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚐</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Shuttles</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚲</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Bicycles</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚢</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Ships</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>✈️</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Planes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>🚂</div>
                <div style={{ color: '#374151', fontWeight: '600' }}>Trains</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companies List View */}
      {currentView === 'companies' && (
        <div>
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={handleBackToAlphabet}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7280';
              }}
            >
              ← Back to Directory
            </button>
          </div>

          <h2 style={{ 
            textAlign: 'center', 
            color: '#1e3a8a', 
            fontSize: '2em',
            marginBottom: '35px',
            fontWeight: '600'
          }}>
            COMPANIES - LETTER {selectedLetter}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {getDisplayCompanies(selectedLetter).map((companyDisplay, index) => {
              const company = companyDisplay.company;
              const thumbnail = getCompanyThumbnail(company);
              
              return (
                <div
                  key={index}
                  onClick={() => handleCompanyClick(companyDisplay)}
                  style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid #2563eb',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.25)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.15)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img
                      src={thumbnail}
                      alt="Company Vehicle"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/transportation/089.jpg';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: '#1e3a8a',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        {companyDisplay.displayName}
                      </h3>
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#6b7280', 
                        fontSize: '0.95em'
                      }}>
                        📍 {companyDisplay.location}
                      </p>
                      <div style={{ 
                        fontSize: '0.85em', 
                        color: '#059669',
                        fontWeight: '500'
                      }}>
                        📷 Fleet Gallery Available
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gallery View */}
      {currentView === 'gallery' && selectedCompany && (
        <div>
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={handleBackToCompanies}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7280';
              }}
            >
              ← Back to Companies - Letter {selectedLetter}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h2 style={{ color: '#1e3a8a', fontSize: '2.2em', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              {selectedCompany.company_name}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.3em', margin: '0 0 8px 0' }}>
              {selectedCompany.city}
              {selectedCompany.state && ` (${selectedCompany.state})`}
            </p>
            <div style={{ 
              display: 'inline-block',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.9em',
              fontWeight: '600'
            }}>
              Professional Transport Services
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              textAlign: 'center', 
              color: '#2563eb', 
              marginBottom: '25px',
              fontSize: '1.5em',
              fontWeight: '600'
            }}>
              🚀 VEHICLE GALLERY
            </h3>
            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              marginBottom: '35px',
              fontSize: '1.1em'
            }}>
              Fleet vehicles available for transportation services
            </p>

            {galleryImages.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  position: 'relative', 
                  display: 'inline-block',
                  marginBottom: '25px'
                }}>
                  <img
                    src={galleryImages[currentGalleryIndex].image}
                    alt="Vehicle"
                    style={{
                      maxWidth: '100%',
                      height: '350px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/transportation/089_bus.jpg';
                    }}
                  />
                  
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '45px',
                          height: '45px',
                          cursor: 'pointer',
                          fontSize: '1.3em',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={handleNextImage}
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '45px',
                          height: '45px',
                          cursor: 'pointer',
                          fontSize: '1.3em',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '15px',
                  maxWidth: '700px',
                  margin: '0 auto 30px auto'
                }}>
                  {galleryImages.map((vehicle, index) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setCurrentGalleryIndex(index)}
                      style={{
                        cursor: 'pointer',
                        border: index === currentGalleryIndex ? '3px solid #2563eb' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (index !== currentGalleryIndex) {
                          e.currentTarget.style.border = '2px solid #93c5fd';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (index !== currentGalleryIndex) {
                          e.currentTarget.style.border = '2px solid #e5e7eb';
                        }
                      }}
                    >
                      <img
                        src={vehicle.image}
                        alt="Vehicle"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/transportation/089_bus.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        backgroundColor: 'rgba(37, 99, 235, 0.95)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '25px',
        fontSize: '0.95em',
        fontWeight: '600',
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        📊 Companies Visited: {visitedCompanies.size}/4
      </div>
    </div>
  );
};

export default Task7;