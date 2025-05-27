import React, { useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileSignature,
  ChevronDown
} from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import { format } from 'date-fns';

type DocumentStatus = 'all' | 'draft' | 'sent' | 'completed' | 'declined';

const DocumentsList: React.FC = () => {
  const { documents, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  // Handle search and filtering
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Sort documents by date (newest first)
  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
  );
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'draft':
        return <FileSignature className="h-5 w-5 text-gray-500" />;
      case 'sent':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'declined':
        return <AlertTriangle className="h-5 w-5 text-error-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-warning-100 text-warning-800';
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'declined':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
          <p className="text-gray-600 mt-1">Manage and track all your documents</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={()=>{
            navigate("/documents/upload")
          }}
        >
          New Document
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
            fullWidth
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            rightIcon={<ChevronDown className="h-4 w-4" />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </Button>
          
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 animate-fade-in">
              <div className="py-1">
                {(['all', 'draft', 'sent', 'completed', 'declined'] as DocumentStatus[]).map((status) => (
                  <button
                    key={status}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      statusFilter === status ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Documents list */}
      <Card>
        <CardBody className="p-0">
          {sortedDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signers
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(doc.status)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link to={`/documents/view/${doc.id}`} className="hover:text-primary-600">
                                {doc.title}
                              </Link>
                            </div>
                            {doc.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {doc.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(doc.status)}`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex -space-x-1 overflow-hidden">
                          {doc.signers.length > 0 ? (
                            <>
                              {doc.signers.slice(0, 3).map((signer, index) => (
                                <div 
                                  key={signer.id} 
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white ${
                                    signer.status === 'signed' ? 'bg-success-100' : 'bg-gray-100'
                                  }`}
                                  title={`${signer.name} (${signer.email})`}
                                >
                                  <span className="text-xs font-medium">
                                    {signer.name.charAt(0)}
                                  </span>
                                </div>
                              ))}
                              {doc.signers.length > 3 && (
                                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-100">
                                  <span className="text-xs font-medium">+{doc.signers.length - 3}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(doc.modified_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {doc.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={()=>{
                                navigate(`/documents/edit/${doc.id}`)
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={()=>{
                              navigate(`/documents/view/${doc.id}`)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try a different search term.' : 'Get started by creating a new document.'}
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={()=>{
                    navigate("/documents/upload")
                  }}
                >
                  New Document
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DocumentsList;