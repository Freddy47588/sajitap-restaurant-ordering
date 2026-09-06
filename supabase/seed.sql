insert into public.restaurants (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'SajiTap Demo Restaurant', 'sajitap-demo')
on conflict (id) do nothing;

insert into public.restaurant_tables (restaurant_id, table_number, label, qr_token, active)
select '00000000-0000-0000-0000-000000000001', number::text, 'Meja ' || number, 'sajitap-demo-' || lpad(number::text, 2, '0'), number <> 8
from generate_series(1, 12) as number
on conflict (restaurant_id, table_number) do nothing;

insert into public.categories (id, restaurant_id, name, sort_order) values
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Makanan Utama', 1),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Mie & Bakso', 2),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Camilan', 3),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Minuman', 4),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Dessert', 5)
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_id, category_id, code, name, slug, description, price, image_url, available, featured, preparation_time, sort_order) values
('00000000-0000-0000-0002-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000001','ST-01','Sate Ayam','sate-ayam','Sate ayam empuk dengan bumbu kacang gurih, lontong, dan acar segar.',22000,'/assets/images/sate-ayam.jpg',true,true,'15–20 menit',1),
('00000000-0000-0000-0002-000000000002','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000001','ST-02','Nasi Goreng Telur','nasi-goreng-telur','Nasi goreng khas rumahan dengan telur mata sapi dan kerupuk.',18000,'/assets/images/nasi-goreng-telor.jpg',true,true,'10–15 menit',2),
('00000000-0000-0000-0002-000000000003','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000001','ST-03','Nasi Rames','nasi-rames','Nasi hangat dengan lauk pilihan dan sayuran harian yang lengkap.',20000,'/assets/images/nasi-rames.jpg',true,true,'15–20 menit',3),
('00000000-0000-0000-0002-000000000004','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000001','ST-04','Nasi Ayam Geprek','nasi-ayam-geprek','Ayam crispy geprek dengan sambal segar dan nasi putih.',23000,'/assets/images/nasi-ayam-geprek.jpg',true,false,'15–20 menit',4),
('00000000-0000-0000-0002-000000000005','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000002','ST-05','Mie Ayam Bakso','mie-ayam-bakso','Mie kenyal dengan ayam kecap, sayuran, dan bakso sapi.',21000,'/assets/images/mie-ayam-bakso.jpg',true,true,'10–15 menit',5),
('00000000-0000-0000-0002-000000000006','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000002','ST-06','Mie Goreng','mie-goreng','Mie goreng berbumbu kecap dengan telur dan sayuran segar.',17000,'/assets/images/mie-goreng.jpg',true,false,'10–15 menit',6),
('00000000-0000-0000-0002-000000000007','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000002','ST-07','Bakso','bakso','Kuah kaldu hangat, bakso sapi, mie, dan taburan daun bawang.',19000,'/assets/images/bakso.jpg',false,false,'12–18 menit',7),
('00000000-0000-0000-0002-000000000008','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000003','ST-08','Pangsit Goreng','pangsit','Pangsit renyah berisi ayam, disajikan dengan saus cocol.',14000,'/assets/images/pangsit.jpg',true,false,'8–12 menit',8),
('00000000-0000-0000-0002-000000000009','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000003','ST-09','Kentang Goreng','kentang-goreng','Kentang goreng renyah dengan taburan bumbu gurih.',15000,'/assets/images/kentang-goreng.jpg',true,false,'8–12 menit',9),
('00000000-0000-0000-0002-000000000010','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000001','ST-10','Lontong Opor Ayam','lontong-opor-ayam','Lontong lembut dalam kuah opor ayam yang kaya rempah.',24000,'/assets/images/lontong-opor-ayam.jpg',true,true,'18–25 menit',10),
('00000000-0000-0000-0002-000000000011','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000004','MN-01','Es Teh Manis','es-teh-manis','Teh melati segar dengan tingkat kemanisan yang pas.',7000,'/assets/images/es-teh-manis.svg',true,true,'3–5 menit',11),
('00000000-0000-0000-0002-000000000012','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000004','MN-02','Es Jeruk Segar','es-jeruk','Perasan jeruk asli yang segar, disajikan dingin.',10000,'/assets/images/es-jeruk.svg',true,false,'3–5 menit',12),
('00000000-0000-0000-0002-000000000013','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000004','MN-03','Kopi Susu Gula Aren','kopi-susu','Espresso, susu segar, dan gula aren dengan rasa seimbang.',16000,'/assets/images/kopi-susu.svg',true,false,'5–8 menit',13),
('00000000-0000-0000-0002-000000000014','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000005','DS-01','Pisang Goreng Keju','pisang-goreng','Pisang goreng hangat dengan keju parut dan susu kental manis.',15000,'/assets/images/pisang-goreng.svg',true,true,'8–12 menit',14),
('00000000-0000-0000-0002-000000000015','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0001-000000000005','DS-02','Puding Cokelat','puding-cokelat','Puding cokelat lembut dengan saus vanila ringan.',12000,'/assets/images/puding-cokelat.svg',true,false,'3–5 menit',15)
on conflict (id) do nothing;

insert into public.menu_option_groups (menu_item_id, name, required, min_select, max_select, sort_order)
select id, 'Tingkat Pedas', true, 1, 1, 1 from public.menu_items where slug in ('sate-ayam','nasi-goreng-telur','nasi-rames','nasi-ayam-geprek','mie-ayam-bakso','mie-goreng','bakso','lontong-opor-ayam');
insert into public.menu_option_groups (menu_item_id, name, required, min_select, max_select, sort_order)
select id, 'Tambahan', false, 0, 3, 2 from public.menu_items where slug in ('sate-ayam','nasi-goreng-telur','nasi-rames','nasi-ayam-geprek','mie-ayam-bakso','mie-goreng','bakso','kentang-goreng','lontong-opor-ayam');
insert into public.menu_option_groups (menu_item_id, name, required, min_select, max_select, sort_order)
select id, 'Topping', false, 0, 2, 1 from public.menu_items where slug = 'pisang-goreng';

insert into public.menu_options (option_group_id, name, price_delta, sort_order)
select g.id, v.name, v.price, v.sort_order from public.menu_option_groups g cross join (values ('Tidak Pedas',0,1),('Sedang',0,2),('Pedas',0,3),('Extra Pedas',2000,4)) v(name,price,sort_order) where g.name = 'Tingkat Pedas';
insert into public.menu_options (option_group_id, name, price_delta, sort_order)
select g.id, v.name, v.price, v.sort_order from public.menu_option_groups g cross join (values ('Extra Telur',5000,1),('Extra Sambal',2000,2),('Keju',4000,3),('Bakso Tambahan',6000,4),('Nasi Tambahan',6000,5)) v(name,price,sort_order) where g.name = 'Tambahan';
insert into public.menu_options (option_group_id, name, price_delta, sort_order)
select g.id, v.name, v.price, v.sort_order from public.menu_option_groups g cross join (values ('Keju',4000,1),('Cokelat',3000,2)) v(name,price,sort_order) where g.name = 'Topping';

insert into public.menu_item_recommendations (menu_item_id, recommended_menu_item_id)
select source.id, target.id from (values
('sate-ayam','es-teh-manis'),('sate-ayam','kentang-goreng'),('nasi-goreng-telur','es-jeruk'),
('nasi-goreng-telur','pangsit'),('mie-ayam-bakso','es-teh-manis'),('mie-ayam-bakso','pangsit'),
('nasi-ayam-geprek','es-jeruk'),('lontong-opor-ayam','pisang-goreng'),('kopi-susu','pisang-goreng')
) pair(source_slug,target_slug)
join public.menu_items source on source.slug = pair.source_slug
join public.menu_items target on target.slug = pair.target_slug
on conflict do nothing;
