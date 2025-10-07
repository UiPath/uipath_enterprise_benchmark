import React, { useState, useEffect } from 'react';

// Task 29: Logistics - Inventory Receiving
// External Excel inventory files (source) → Barcode scanning terminal with table management (target)

interface InventoryItem {
  poNumber: string;
  supplierName: string;
  itemDescription: string;
  quantityOrdered: number;
  unitPrice: number;
  deliveryDate: string;
  inspectorName: string;
  conditionNotes: string;
  itemWeight: string;
  conditionStatus: string;
  photoCaptured: boolean;
}

const Task29: React.FC = () => {
  const [receivedItems, setReceivedItems] = useState<InventoryItem[]>([]);
  
  // Current form state
  const [poNumber, setPoNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [conditionStatus, setConditionStatus] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  
  // UI state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [contextMenuRow, setContextMenuRow] = useState<number | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Expose app_state for testing
  useEffect(() => {
    const currentFormEntry = {
      poNumber: poNumber.trim(),
      supplierName: supplierName.trim(),
      itemDescription: itemDescription.trim(),
      quantityOrdered,
      unitPrice,
      deliveryDate: deliveryDate.trim(),
      inspectorName: inspectorName.trim(),
      conditionNotes: conditionNotes.trim(),
      itemWeight: itemWeight.trim(),
      conditionStatus: conditionStatus.trim(),
      photoCaptured
    };

    const formFieldsCompleted = {
      hasPoNumber: poNumber.trim().length > 0,
      hasSupplierName: supplierName.trim().length > 0,
      hasItemDescription: itemDescription.trim().length > 0,
      hasQuantityOrdered: quantityOrdered > 0,
      hasUnitPrice: unitPrice > 0,
      hasDeliveryDate: deliveryDate.trim().length > 0,
      hasInspectorName: inspectorName.trim().length > 0,
      hasConditionNotes: conditionNotes.trim().length > 0,
      hasItemWeight: itemWeight.trim().length > 0,
      hasConditionStatus: conditionStatus.trim().length > 0,
      hasPhotoCaptured: photoCaptured
    };

    (window as any).app_state = {
      receivedItems,
      totalReceivedItems: receivedItems.length,
      currentFormEntry,
      formFieldsCompleted
    };
  }, [receivedItems, poNumber, supplierName, itemDescription, quantityOrdered, unitPrice, deliveryDate, inspectorName, conditionNotes, itemWeight, conditionStatus, photoCaptured]);

  const handleBarcodeSimulation = () => {
    if (barcodeInput.trim()) {
      setPoNumber(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  const handleCapturePhoto = () => {
    setPhotoCaptured(true);
    setShowPhotoCapture(false);
  };

  const handleAddToReceiving = () => {
    // Silent validation
    if (!poNumber.trim()) return;
    if (!supplierName.trim()) return;
    if (!itemDescription.trim()) return;
    if (quantityOrdered <= 0) return;
    if (unitPrice <= 0) return;
    if (!deliveryDate.trim()) return;
    if (!inspectorName.trim()) return;
    if (!conditionNotes.trim()) return;
    if (!itemWeight.trim()) return;
    if (!conditionStatus.trim()) return;

    const newItem: InventoryItem = {
      poNumber: poNumber.trim(),
      supplierName: supplierName.trim(),
      itemDescription: itemDescription.trim(),
      quantityOrdered,
      unitPrice,
      deliveryDate: deliveryDate.trim(),
      inspectorName: inspectorName.trim(),
      conditionNotes: conditionNotes.trim(),
      itemWeight: itemWeight.trim(),
      conditionStatus: conditionStatus.trim(),
      photoCaptured
    };

    setReceivedItems([...receivedItems, newItem]);

    // Reset form
    setPoNumber('');
    setSupplierName('');
    setItemDescription('');
    setQuantityOrdered(0);
    setUnitPrice(0);
    setDeliveryDate('');
    setInspectorName('');
    setConditionNotes('');
    setItemWeight('');
    setConditionStatus('');
    setPhotoCaptured(false);
  };

  const handleRemoveItem = (index: number) => {
    setReceivedItems(receivedItems.filter((_, i) => i !== index));
  };

  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenuRow(index);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenuRow(null);
  };

  const handleQuantityIncrement = () => {
    setQuantityOrdered(quantityOrdered + 1);
  };

  const handleQuantityDecrement = () => {
    if (quantityOrdered > 0) {
      setQuantityOrdered(quantityOrdered - 1);
    }
  };

  const handlePriceIncrement = () => {
    setUnitPrice(Math.round((unitPrice + 0.01) * 100) / 100);
  };

  const handlePriceDecrement = () => {
    if (unitPrice > 0) {
      setUnitPrice(Math.max(0, Math.round((unitPrice - 0.01) * 100) / 100));
    }
  };

  useEffect(() => {
    const handleClick = () => handleCloseContextMenu();
    if (contextMenuRow !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenuRow]);

  const conditionOptions = [
    'Excellent',
    'Good',
    'Fair',
    'Damaged',
    'Needs Inspection'
  ];

  return (
    <div style={{ 
      fontFamily: 'Courier New, monospace', 
      backgroundColor: '#1a1a1a', 
      color: '#00ff00', 
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1500px'
      }}>
      {/* Terminal Header */}
      <div style={{ 
        borderBottom: '2px solid #00ff00', 
        paddingBottom: '10px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>WAREHOUSE RECEIVING TERMINAL</div>
          <div style={{ fontSize: '12px', color: '#00cc00', marginTop: '5px' }}>
            System Status: ONLINE | Items Received: {receivedItems.length}
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#00cc00' }}>
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* Barcode Scanner Section */}
      <div style={{ 
        backgroundColor: '#0d0d0d', 
        border: '2px dashed #00ff00', 
        padding: '20px', 
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>📷</span>
          BARCODE SCANNER
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSimulation()}
            placeholder="Scan or enter PO number..."
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#000',
              color: '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'Courier New, monospace',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleBarcodeSimulation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00ff00',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold'
            }}
          >
            SCAN
          </button>
        </div>
      </div>

      {/* Receiving Form */}
      <div style={{ 
        backgroundColor: '#0d0d0d', 
        border: '1px solid #00ff00', 
        padding: '20px', 
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          ITEM RECEIVING FORM
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* PO Number */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              PO NUMBER *
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g., PO-2024-157"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Supplier Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              SUPPLIER NAME *
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Supplier name"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Item Description */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              ITEM DESCRIPTION *
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Item description"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Quantity Ordered with Spinner */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              QUANTITY ORDERED *
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={handleQuantityDecrement}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#004400',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <input
                type="number"
                value={quantityOrdered}
                onChange={(e) => setQuantityOrdered(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#000',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={handleQuantityIncrement}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#004400',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Unit Price with Spinner */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              UNIT PRICE ($) *
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={handlePriceDecrement}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#004400',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#000',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={handlePriceIncrement}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#004400',
                  color: '#00ff00',
                  border: '1px solid #00ff00',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              DELIVERY DATE *
            </label>
            <input
              type="text"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Inspector Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              INSPECTOR NAME *
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Inspector name"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Item Weight */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              ITEM WEIGHT *
            </label>
            <input
              type="text"
              value={itemWeight}
              onChange={(e) => setItemWeight(e.target.value)}
              placeholder="e.g., 0.5 kg"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Condition Status */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              CONDITION STATUS *
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {conditionOptions.map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="conditionStatus"
                    value={option}
                    checked={conditionStatus === option}
                    onChange={(e) => setConditionStatus(e.target.value)}
                    style={{ marginRight: '5px' }}
                  />
                  <span style={{ fontSize: '12px' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Notes */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              CONDITION NOTES *
            </label>
            <textarea
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Enter condition notes"
              rows={2}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#000',
                color: '#00ff00',
                border: '1px solid #00ff00',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Photo Capture */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              CONDITION PHOTO
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowPhotoCapture(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: photoCaptured ? '#004400' : '#00ff00',
                  color: photoCaptured ? '#00ff00' : '#000',
                  border: photoCaptured ? '1px solid #00ff00' : 'none',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                📸 {photoCaptured ? 'PHOTO CAPTURED' : 'CAPTURE PHOTO'}
              </button>
              {photoCaptured && (
                <span style={{ fontSize: '12px', color: '#00ff00' }}>✓ Photo captured</span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Receiving Button */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleAddToReceiving}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#00ff00',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ✓ ADD TO RECEIVING TABLE
          </button>
        </div>
      </div>

      {/* Received Items Table */}
      <div style={{ 
        backgroundColor: '#0d0d0d', 
        border: '1px solid #00ff00', 
        padding: '20px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          RECEIVED ITEMS TABLE ({receivedItems.length})
        </div>
        
        {receivedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#00cc00' }}>
            No items received yet. Use the form above to add items.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#004400', borderBottom: '2px solid #00ff00' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>PO #</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>SUPPLIER</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>ITEM</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>QTY</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>PRICE</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>DATE</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>INSPECTOR</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>WEIGHT</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>CONDITION</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>NOTES</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>PHOTO</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #00ff00' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {receivedItems.map((item, index) => (
                  <tr 
                    key={index}
                    onContextMenu={(e) => handleRightClick(e, index)}
                    style={{ 
                      borderBottom: '1px solid #00ff00',
                      cursor: 'context-menu'
                    }}
                  >
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.poNumber}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.supplierName}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.itemDescription}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.quantityOrdered}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>${item.unitPrice.toFixed(2)}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.deliveryDate}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.inspectorName}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.itemWeight}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>{item.conditionStatus}</td>
                    <td style={{ padding: '8px', border: '1px solid #004400', maxWidth: '200px' }}>
                      {item.conditionNotes}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #004400', textAlign: 'center' }}>
                      {item.photoCaptured ? '✓' : '-'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #004400' }}>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#660000',
                          color: '#ff0000',
                          border: '1px solid #ff0000',
                          cursor: 'pointer',
                          fontFamily: 'Courier New, monospace',
                          fontSize: '11px'
                        }}
                      >
                        REMOVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #00ff00',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
              CONDITION PHOTO CAPTURE
            </div>
            
            <div style={{
              backgroundColor: '#000',
              border: '2px dashed #00ff00',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                <div style={{ fontSize: '14px', color: '#00cc00' }}>
                  Simulated photo capture area
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#00cc00', marginBottom: '20px' }}>
              This simulates capturing a photo of the item condition for documentation purposes.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCapturePhoto}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#00ff00',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                CAPTURE
              </button>
              <button
                onClick={() => setShowPhotoCapture(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#660000',
                  color: '#ff0000',
                  border: '1px solid #ff0000',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenuRow !== null && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            backgroundColor: '#0d0d0d',
            border: '1px solid #00ff00',
            padding: '5px',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <div
            onClick={() => {
              handleRemoveItem(contextMenuRow);
              handleCloseContextMenu();
            }}
            style={{
              padding: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004400'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🗑️ Remove Row
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Task29;

