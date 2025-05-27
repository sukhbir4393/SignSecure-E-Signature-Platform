import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Upload, Clock, CheckCircle, AlertTriangle, FileSignature } from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import { useUser } from '../../contexts/UserContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { documents, isLoading } = useDocuments();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // Calculate document statistics
  const stats = {
    draft: documents.filter(doc => doc.status === 'draft').length,
    sent: documents.filter(doc => doc.status === 'sent').length,
    completed: documents.filter(doc => doc.status === 'completed').length,
    all: documents.length
  };

  // Get recent documents (up to 5)
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
    .slice(0, 5);

  // Get documents waiting for signatures
  const waitingForSignature = documents.filter(doc => doc.status === 'sent');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name}</h1>
          <p className="text-gray-600 mt-1">Here's an overview of your documents and signatures</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="primary"
            leftIcon={<Upload className="h-4 w-4"

            />}
            onClick={() => {
              navigate("/documents/upload")
            }}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardBody className="flex items-center py-6">
            <div className="rounded-full bg-primary-100 p-3 mr-4">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">All Documents</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.all}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="flex items-center py-6">
            <div className="rounded-full bg-secondary-100 p-3 mr-4">
              <FileSignature className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Drafts</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="flex items-center py-6">
            <div className="rounded-full bg-warning-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Waiting for Signature</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="flex items-center py-6">
            <div className="rounded-full bg-success-100 p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Completed</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent documents section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
                <Link to="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {recentDocuments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentDocuments.map(doc => (
                    <div key={doc.id} className="py-4 px-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-4">
                            {doc.status === 'draft' && <FileSignature className="h-5 w-5 text-gray-500" />}
                            {doc.status === 'sent' && <Clock className="h-5 w-5 text-warning-500" />}
                            {doc.status === 'completed' && <CheckCircle className="h-5 w-5 text-success-500" />}
                            {doc.status === 'declined' && <AlertTriangle className="h-5 w-5 text-error-500" />}
                          </div>
                          <div>
                            <Link to={`/documents/view/${doc.id}`} className="text-base font-medium text-gray-900 hover:text-primary-600">
                              {doc.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {/* Updated {format(new Date(doc.modified_at), 'MMM d, yyyy')} */}
                              Updated {doc.modified_at}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${doc.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                            ${doc.status === 'sent' ? 'bg-warning-100 text-warning-800' : ''}
                            ${doc.status === 'completed' ? 'bg-success-100 text-success-800' : ''}
                            ${doc.status === 'declined' ? 'bg-error-100 text-error-800' : ''}
                          `}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No documents yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      navigate("/documents/upload")
                    }}
                  >
                    Upload your first document
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="bg-white h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Waiting for Signature</h2>
            </CardHeader>
            <CardBody className="p-0">
              {waitingForSignature.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {waitingForSignature.map(doc => (
                    <div key={doc.id} className="py-4 px-6 hover:bg-gray-50 transition-colors duration-150">
                      <Link to={`/documents/view/${doc.id}`} className="block">
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {doc.signers.map(signer => (
                            <div
                              key={signer.id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                                ${signer.status === 'signed' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'}
                              `}
                            >
                              {signer.status === 'signed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {signer.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {signer.name}
                            </div>
                          ))}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No documents waiting for signature</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;