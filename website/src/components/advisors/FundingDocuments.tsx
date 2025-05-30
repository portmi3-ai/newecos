import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { FileText, FileEdit, Share2, PlusCircle, Folder } from 'lucide-react';
import type { FundingDocument, DocumentType, DataRoom } from '../../types/advisorAgent';

interface FundingDocumentsProps {
  documents: FundingDocument[];
  dataRooms?: DataRoom[];
  onGenerateDocument?: (type: DocumentType) => void;
  onViewDocument?: (documentId: string) => void;
  onEditDocument?: (documentId: string) => void;
  onShareDocument?: (documentId: string) => void;
  onCreateDataRoom?: () => void;
  onViewDataRoom?: (dataRoomId: string) => void;
  isLoading?: boolean;
}

const FundingDocuments: React.FC<FundingDocumentsProps> = ({
  documents,
  dataRooms = [],
  onGenerateDocument,
  onViewDocument,
  onEditDocument,
  onShareDocument,
  onCreateDataRoom,
  onViewDataRoom,
  isLoading = false
}) => {
  const [documentTypeToGenerate, setDocumentTypeToGenerate] = useState<DocumentType | ''>('');
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);

  const handleGenerateDocument = () => {
    if (documentTypeToGenerate && onGenerateDocument) {
      onGenerateDocument(documentTypeToGenerate as DocumentType);
      setDocumentTypeToGenerate('');
      setShowGenerateMenu(false);
    }
  };

  const documentTypeOptions: DocumentType[] = [
    'Executive Summary', 
    'Pitch Deck', 
    'One-Pager', 
    'Financial Model',
    'Cap Table',
    'Due Diligence Checklist'
  ];

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'Executive Summary':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'Pitch Deck':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'One-Pager':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'Financial Model':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'Cap Table':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'Due Diligence Checklist':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Funding Documents</h2>
        <div className="flex space-x-2">
          {onGenerateDocument && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              >
                Generate Document
              </Button>
              
              {showGenerateMenu && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Document Type</div>
                    <select
                      className="block w-full px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={documentTypeToGenerate}
                      onChange={(e) => setDocumentTypeToGenerate(e.target.value as DocumentType)}
                    >
                      <option value="">Select document type...</option>
                      {documentTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="border-t border-gray-200 mt-2 pt-2 px-3 py-2">
                      <Button
                        size="sm"
                        fullWidth
                        disabled={!documentTypeToGenerate}
                        onClick={handleGenerateDocument}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {onCreateDataRoom && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Folder className="h-4 w-4" />}
              onClick={onCreateDataRoom}
            >
              Create Data Room
            </Button>
          )}
        </div>
      </Card.Header>
      
      <Card.Body className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-6">
                  Generate your first funding document to get started.
                </p>
                {onGenerateDocument && (
                  <Button
                    variant="primary"
                    leftIcon={<PlusCircle className="h-4 w-4" />}
                    onClick={() => setShowGenerateMenu(true)}
                  >
                    Generate First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              <div className="text-sm text-gray-500">Version {document.version}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            document.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                            document.status === 'Ready' ? 'bg-green-100 text-green-800' :
                            document.status === 'Shared' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {document.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(document.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {onViewDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDocument(document.id)}
                              >
                                View
                              </Button>
                            )}
                            
                            {onEditDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FileEdit className="h-4 w-4" />}
                                onClick={() => onEditDocument(document.id)}
                              >
                                Edit
                              </Button>
                            )}
                            
                            {onShareDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Share2 className="h-4 w-4" />}
                                onClick={() => onShareDocument(document.id)}
                              >
                                Share
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {dataRooms.length > 0 && (
              <div className="mt-8 px-6 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Rooms</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dataRooms.map((dataRoom) => (
                    <div
                      key={dataRoom.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewDataRoom && onViewDataRoom(dataRoom.id)}
                    >
                      <div className="flex items-start mb-2">
                        <Folder className="h-5 w-5 text-primary-500 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">{dataRoom.name}</h4>
                          {dataRoom.description && (
                            <p className="text-sm text-gray-500">{dataRoom.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="text-gray-500">{dataRoom.documents.length} documents</div>
                        <div className="text-gray-500">{dataRoom.investors.length} investors</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FundingDocuments;