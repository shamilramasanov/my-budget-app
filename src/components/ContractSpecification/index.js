// src/components/ContractSpecification/index.js
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';
import { Plus } from 'lucide-react';
import SpecificationForm from './SpecificationForm';
import SpecificationTable from './SpecificationTable';
import UsageForm from './UsageForm';
import UsageHistory from './UsageHistory';

const ContractSpecification = ({ contract, onUpdate }) => {
  const [selectedSpec, setSelectedSpec] = React.useState(null);

  const handleAddSpecification = (newSpec) => {
    const updatedContract = {
      ...contract,
      specifications: [...(contract.specifications || []), newSpec]
    };
    onUpdate(updatedContract);
  };

  const handleUpdateSpecification = (updatedSpec) => {
    const updatedSpecs = contract.specifications.map(spec =>
      spec.id === updatedSpec.id ? updatedSpec : spec
    );
    onUpdate({
      ...contract,
      specifications: updatedSpecs
    });
  };

  const handleDeleteSpecification = (specId) => {
    const updatedSpecs = contract.specifications.filter(spec => spec.id !== specId);
    onUpdate({
      ...contract,
      specifications: updatedSpecs
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Специфікація договору</h2>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Додати позицію
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Нова позиція специфікації</DialogTitle>
            </DialogHeader>
            <SpecificationForm onSubmit={handleAddSpecification} />
          </DialogContent>
        </Dialog>
      </div>

      <SpecificationTable
        specifications={contract.specifications || []}
        onUpdate={handleUpdateSpecification}
        onDelete={handleDeleteSpecification}
        onSelectSpec={setSelectedSpec}
      />

      {selectedSpec && (
        <UsageHistory
          specification={selectedSpec}
          onClose={() => setSelectedSpec(null)}
          onUpdate={handleUpdateSpecification}
        />
      )}
    </div>
  );
};

export default ContractSpecification;