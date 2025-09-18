import React, { useState, useEffect } from 'react';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Modal from '../../ui/Modal';
import styles from './AddressSection.module.scss';
import {
  getAddresses,
  addAddress,
  deleteAddress,
} from '../../../../endpoints/addresses';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import { AddressData } from '../../../../types/userData';
import MapComponent from '../../../CreateProduct/components/MapComponent';
import { useGetRegionById, useGetRegions } from '../../../../hooks/user';
import { useRouter } from 'next/router';
import { MdGppBad, MdOutlineGppGood } from 'react-icons/md';

type Address = {
  user_id: number;
  name: string;
  id: number;
  lat: string;
  long: string;
  address: string;
  is_main: boolean;
  region_id: number | undefined;
  district_id: number | undefined;
};

export type AddAddress = {
  user_id: number;
  name: string;
  lat?: string;
  long?: string;
  address: string;
  is_main: boolean;
  region_id: number | undefined;
  district_id: number | undefined;
};

enum SelectType {
  default = 'default',
  manual = 'manual',
}

interface Region {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

const AddressSection = () => {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [selectType, setSelectType] = useState<SelectType>(SelectType.default);
  const [selectTypeLocation, setSelectTypeLocation] = useState<SelectType>(
    SelectType.default,
  );

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [addressData, setAddressData] = useState<AddressData>({
    user_id: Number(user?.id) || 0,
    region_id: null,
    district_id: null,
    name: '',
    lat: null,
    long: null,
    address: '',
  });
  const { data: oneRegion } = useGetRegionById(addressData.region_id || 0);
  const { data: regions } = useGetRegions();

  const fetchAddresses = async (id: number | undefined) => {
    if (!id) return;
    setLoading(true);
    const data = await getAddresses(+id);
    if (data) setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses(user?.id);
  }, [user?.id]);

  const handleAddAddress = async () => {
    try {
      if (selectTypeLocation === SelectType.manual) {
        const { user_id, name, lat, long, address, region_id, district_id } =
          addressData;

        if (process.env.NODE_ENV === "development") console.log('addressData: ', addressData);

        if (!name || !lat || !long || !address) {
          toast.error('Iltimos, xaritadan to‘liq manzil tanlang');
          return;
        }

        const newAddress: AddAddress = {
          user_id: user_id,
          name,
          lat: lat.toString(),
          long: long.toString(),
          is_main: false,
          address,
          region_id: undefined,
          district_id: undefined,
        };

        const added = await addAddress(newAddress);
        if (added) {
          setAddresses((prev) => [...prev, added]);
          setAddressData({
            user_id: Number(user?.id) || 0,
            region_id: null,
            district_id: null,
            name: name,
            lat: addressData.lat,
            long: addressData.long,
            address: addressData.address,
          });
          setShowForm(false);
          toast.success('Manzil saqlandi');
          router.push('/Profile');
        }
      } else if (selectTypeLocation === SelectType.default) {
        if (!name.trim() || !fullAddress.trim()) {
          toast.error('Manzil va nom bo‘sh bo‘lishi mumkin emas');
          return;
        }

        const newAddress: AddAddress = {
          user_id: Number(user?.id) || 0,
          name: name.trim(),
          lat: '',
          long: '',
          is_main: false,
          region_id: addressData.region_id || undefined,
          district_id: addressData.district_id || undefined,
          address: fullAddress.trim(),
        };
        if (process.env.NODE_ENV === "development") console.log('newAddress: ', newAddress);
        const cleanedAddress: AddAddress = {
          user_id: Number(user?.id),
          name: name.trim(),
          address: fullAddress.trim(),
          lat: addressData.lat || undefined,
          long: addressData.long || undefined,
          is_main: false,
          region_id: addressData.region_id || undefined,
          district_id: addressData.district_id || undefined,
        };

        const added = await addAddress(cleanedAddress);

        // const added = await addAddress(newAddress);
        if (added) {
          setAddresses((prev) => [...prev, added]);
          setName('');
          setFullAddress('');
          setShowForm(false);
          toast.success('Manzil qo‘shildi');
          router.push('/Profile');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmed = window.confirm('Ишончингиз комилми?');

    if (!confirmed) return;

    const res = await deleteAddress(+id, user?.id);
    if (res == false) {
      toast('something went wrong on deleting');
    }
    if (res) {
      setAddresses((prev) => prev.filter((item) => +item.id !== +id));
    } else {
      toast.error('Манзилни ўчиришда хатолик юз берди');
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.item} onClick={() => setOpen(!open)}>
          <span>Адрес</span>
          <span className={styles.arrow}>
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>

        {open && (
          <div className={styles.subsection}>
            {loading ? (
              <div className={styles.loader}>Юкланмоқда...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Main</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address, index) => (
                    <tr key={address.id}>
                      <th>{index + 1}</th>
                      <th>{address.name}</th>
                      <th>{address.address}</th>
                      <th>
                        {address.is_main ? <MdOutlineGppGood /> : <MdGppBad />}
                      </th>
                      <th>
                        <div
                          className={`${styles.items} ${styles.delete}`}
                          onClick={() =>
                            handleDeleteAddress(address.id.toString())
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <RiDeleteBin5Line />
                        </div>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className={styles.addButton} onClick={() => setShowForm(true)}>
              + Добавить адрес
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h3 className={styles.modalTitle}>Добавить адрес</h3>

        <div className={styles.form}>
          <div className={styles.form__location}>
            <p>Адрес продажи</p>
            <div className={styles.select_buttons_wrapper}>
              <button
                type="button"
                className={
                  styles.select_button +
                  ' ' +
                  (selectTypeLocation === SelectType.default
                    ? styles.active
                    : '')
                }
                onClick={() => setSelectTypeLocation(SelectType.default)}
              >
                Выбрать
              </button>
              <button
                type="button"
                className={
                  styles.select_button +
                  ' ' +
                  (selectTypeLocation === SelectType.manual
                    ? styles.active
                    : '')
                }
                onClick={() => setSelectTypeLocation(SelectType.manual)}
              >
                Ввести вручную
              </button>
            </div>

            {selectTypeLocation === SelectType.default ? (
              <div>
                {/* Region va district selectlari */}
                <div>
                  <p className={styles.select_label}>Выбрать регион</p>
                  <select
                    className={styles.select}
                    value={addressData.region_id || ''}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        region_id: +e.target.value,
                        district_id: null, // Reset district when region changes
                      })
                    }
                  >
                    <option disabled value="">
                      Выберите регион
                    </option>
                    {regions?.map((region: Region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className={styles.select_label}>Выбрать город или район</p>
                  <select
                    className={styles.select}
                    value={addressData.district_id || ''}
                    onChange={(e) =>
                      setAddressData((prev) => ({
                        ...prev,
                        district_id: +e.target.value,
                      }))
                    }
                    disabled={!addressData.region_id}
                  >
                    <option disabled value="">
                      Выберите город или район
                    </option>
                    {oneRegion?.district?.map((district: District) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* YANGI: Manzil nomi va to‘liq manzil uchun inputlar */}
                <div className={styles.inputGroup}>
                  <label>Название адреса</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Дом, Офис..."
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Полный адрес</label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="Улица, номер дома и т.д."
                    className={styles.input}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.map}>
                <MapComponent
                  addressData={addressData}
                  setAddressData={setAddressData}
                />
                <div className={styles.form__location__textForMap}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setAddressData({ ...addressData, name: e.target.value });
                      setName(e.target.value);
                      if (process.env.NODE_ENV === "development") console.log(e.target.value);
                    }}
                    className={styles.input}
                    placeholder="Например: Дом, Офис..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleAddAddress} className={styles.button}>
          Сохранить
        </button>
      </Modal>
    </>
  );
};

export default AddressSection;
