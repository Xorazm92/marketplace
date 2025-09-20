import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiTag, FiPercent } from 'react-icons/fi';

interface OfferPageProps {
  offerId: string;
}

const OfferPage: NextPage<OfferPageProps> = ({ offerId }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Maxsus taklif #{offerId} - INBOLA</title>
        <meta name="description" content={`INBOLA da maxsus taklif #${offerId}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Orqaga
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8">
              <FiTag className="mx-auto mb-4" size={48} />
              <h1 className="text-3xl font-bold mb-2">Maxsus Taklif #{offerId}</h1>
              <p className="text-blue-100">Bu sahifa hozircha ishlab chiqilmoqda</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Tez orada...</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4">
                  <FiPercent className="mx-auto mb-2 text-green-500" size={24} />
                  <h3 className="font-medium">Chegirmalar</h3>
                  <p className="text-sm text-gray-600">50% gacha chegirma</p>
                </div>
                <div className="p-4">
                  <FiCalendar className="mx-auto mb-2 text-blue-500" size={24} />
                  <h3 className="font-medium">Muddatli takliflar</h3>
                  <p className="text-sm text-gray-600">Cheklangan vaqt</p>
                </div>
                <div className="p-4">
                  <FiTag className="mx-auto mb-2 text-purple-500" size={24} />
                  <h3 className="font-medium">Maxsus narxlar</h3>
                  <p className="text-sm text-gray-600">Faqat sizga</p>
                </div>
              </div>
            </div>

            <div className="space-x-4">
              <Link 
                href="/"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bosh sahifa
              </Link>
              <Link 
                href="/products"
                className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Mahsulotlar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  return {
    props: {
      offerId: Array.isArray(id) ? id[0] : id,
    },
  };
};

export default OfferPage;
