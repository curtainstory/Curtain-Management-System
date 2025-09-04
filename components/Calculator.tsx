import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { Fabric, Settings, NewOrderItem, Unit } from '../types';

interface CalculatorProps {
  showAlert: (message: string) => void;
  switchView: (view: 'calculator' | 'orders' | 'settings') => void;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">{label}</label>
        <input {...props} className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div className="flex flex-col">
        <label className="mb-1 font-medium text-gray-700">{label}</label>
        <select {...props} className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
            {children}
        </select>
    </div>
);

const Calculator: React.FC<CalculatorProps> = ({ showAlert, switchView }) => {
    // State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [orderItems, setOrderItems] = useState<NewOrderItem[]>([]);
    
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [selectedFabricName, setSelectedFabricName] = useState('');
    const [selectedFabricId, setSelectedFabricId] = useState('');
    const [itemType, setItemType] = useState<'curtain' | 'other'>('curtain');
    const [length, setLength] = useState('');
    const [lengthUnit, setLengthUnit] = useState<Unit>(Unit.CM);
    const [quantity, setQuantity] = useState('');

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [settingsData, fabricsData] = await Promise.all([
                    apiService.getSettings(),
                    apiService.getFabrics(),
                ]);
                setSettings(settingsData);
                setFabrics(fabricsData);
            } catch (error) {
                showAlert('Failed to load initial data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [showAlert]);

    const uniqueFabricNames = useMemo(() => [...new Set(fabrics.map(f => f.name))], [fabrics]);
    const designCodesForSelectedFabric = useMemo(() => fabrics.filter(f => f.name === selectedFabricName), [fabrics, selectedFabricName]);
    
    const totalCost = useMemo(() => orderItems.reduce((acc, item) => acc + item.cost, 0), [orderItems]);

    const handleAddFabric = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFabricId || !length || !quantity || !settings) {
            showAlert('Please fill all required fields.');
            return;
        }

        const lengthValue = parseFloat(length);
        const quantityValue = parseInt(quantity, 10);
        const selectedFabric = fabrics.find(f => f.id === parseInt(selectedFabricId));

        if (!selectedFabric || isNaN(lengthValue) || isNaN(quantityValue) || quantityValue <= 0 || lengthValue <=0) {
            showAlert('Please enter valid numeric values for length and quantity.');
            return;
        }
        
        const convertToCm = (value: number, unit: Unit): number => {
            switch (unit) {
                case Unit.METER: return value * 100;
                case Unit.INCH: return value * 2.54;
                case Unit.FEET: return value * 30.48;
                default: return value;
            }
        };
        
        const lengthCm = convertToCm(lengthValue, lengthUnit);

        let fabricUsedM;
        let itemCost;
        if (itemType === 'curtain') {
            fabricUsedM = quantityValue * ((lengthCm + settings.extra_hem_cm) / 100);
            itemCost = fabricUsedM * selectedFabric.price_per_meter + (quantityValue * settings.stitching_price);
        } else {
            fabricUsedM = (lengthCm * quantityValue) / 100;
            itemCost = fabricUsedM * selectedFabric.price_per_meter;
        }
        
        const newItem: NewOrderItem = {
            fabric_id: selectedFabric.id,
            design_code: selectedFabric.design_code,
            fabric_name: selectedFabric.name,
            item_type: itemType,
            length_cm: parseFloat(lengthCm.toFixed(2)),
            quantity: quantityValue,
            cost: parseFloat(itemCost.toFixed(2)),
            fabric_used_m: parseFloat(fabricUsedM.toFixed(2)),
        };

        setOrderItems(prevItems => [...prevItems, newItem]);

        // Reset form
        setSelectedFabricId('');
        setItemType('curtain');
        setLength('');
        setLengthUnit(Unit.CM);
        setQuantity('');

    }, [selectedFabricId, length, quantity, settings, fabrics, showAlert, lengthUnit, itemType]);

    const handleRemoveItem = useCallback((index: number) => {
        setOrderItems(prevItems => prevItems.filter((_, i) => i !== index));
    }, []);
    
    const handleSaveOrder = async () => {
        if (!customerName.trim()) {
            showAlert('Customer name is required.');
            return;
        }
        if (orderItems.length === 0) {
            showAlert('Cannot save an empty order. Please add items.');
            return;
        }
        
        const orderData = {
            customer: { name: customerName, phone: customerPhone, address: customerAddress },
            items: orderItems,
        };

        const result = await apiService.addOrder(orderData);
        // Fix: Restructured conditional to handle the error case first for correct type narrowing.
        if (!result.success) {
            showAlert(`Failed to save order: ${result.error}`);
            return;
        }

        showAlert(`Order saved successfully! Order ID: ${result.order_id}`);
        // Reset state
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setOrderItems([]);
        setSelectedFabricName('');
        switchView('orders');
    };
    
    if (isLoading) {
        return <div className="text-center p-10">Loading calculator...</div>;
    }
    
    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Name" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Doe" required />
                    <InputField label="Phone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="555-123-4567" />
                    <InputField label="Address" type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="123 Main St, Anytown" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Add Item to Order</h2>
                <form onSubmit={handleAddFabric} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField label="Fabric Name" value={selectedFabricName} onChange={e => { setSelectedFabricName(e.target.value); setSelectedFabricId(''); }}>
                            <option value="">Select a fabric name</option>
                            {uniqueFabricNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </SelectField>
                        <SelectField label="Design Code" value={selectedFabricId} onChange={e => setSelectedFabricId(e.target.value)} disabled={!selectedFabricName}>
                            <option value="">Select a design code</option>
                            {designCodesForSelectedFabric.map(fabric => <option key={fabric.id} value={fabric.id}>{`${fabric.design_code} (${fabric.price_per_meter.toFixed(2)}/m)`}</option>)}
                        </SelectField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SelectField label="Item Type" value={itemType} onChange={e => setItemType(e.target.value as 'curtain' | 'other')}>
                            <option value="curtain">Curtain</option>
                            <option value="other">Other Fabric</option>
                        </SelectField>
                        <div className="flex flex-col">
                             <label className="mb-1 font-medium text-gray-700">Length</label>
                             <div className="flex">
                                <input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 250" className="border border-gray-300 p-2 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full" />
                                <select value={lengthUnit} onChange={e => setLengthUnit(e.target.value as Unit)} className="border-t border-r border-b border-gray-300 p-2 rounded-r-md bg-gray-50 hover:bg-gray-100 transition focus:outline-none">
                                    {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                             </div>
                        </div>
                        <InputField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 2" />
                        <div className="flex flex-col justify-end">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition h-full">Add to Order</button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Order Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-medium text-gray-600">Fabric</th>
                                <th className="p-3 font-medium text-gray-600">Type</th>
                                <th className="p-3 font-medium text-gray-600">Length (cm)</th>
                                <th className="p-3 font-medium text-gray-600">Qty</th>
                                <th className="p-3 font-medium text-gray-600">Cost</th>
                                <th className="p-3 font-medium text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.length > 0 ? orderItems.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{`${item.design_code} (${item.fabric_name})`}</td>
                                    <td className="p-3 capitalize">{item.item_type}</td>
                                    <td className="p-3">{item.length_cm}</td>
                                    <td className="p-3">{item.quantity}</td>
                                    <td className="p-3">${item.cost.toFixed(2)}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="p-3 text-center text-gray-500">No items added yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right">
                    <p className="text-2xl font-bold text-gray-800">Total: <span className="text-indigo-600">${totalCost.toFixed(2)}</span></p>
                    <button onClick={handleSaveOrder} className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition shadow">Save Order</button>
                </div>
            </div>
        </div>
    );
};

export default Calculator;