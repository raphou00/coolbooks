--
-- PostgreSQL database dump
--

\restrict 0YfchcwktLEkc0ujsZEzmCLoJhIkQqsKfwXb3KbAEIVZuwgmkGS5WbQ5flSEoxo

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Book; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Book" (
    id text NOT NULL,
    title text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    cover text NOT NULL,
    age text DEFAULT ''::text NOT NULL,
    "artStyle" text DEFAULT ''::text NOT NULL,
    public boolean DEFAULT false NOT NULL,
    themes text[] DEFAULT ARRAY[]::text[],
    generating boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Book" OWNER TO postgres;

--
-- Name: Page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Page" (
    id text NOT NULL,
    text text NOT NULL,
    "bookId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    color text NOT NULL,
    image text NOT NULL,
    number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Page" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    ip text,
    browser text,
    os text,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Token" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Token" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "googleId" text,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "stripeProductId" text,
    "subscriptionStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    credits integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Book; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Book" (id, title, "userId", "createdAt", "updatedAt", cover, age, "artStyle", public, themes, generating) FROM stdin;
339ac7a8-1340-41f1-a6f9-5642c8e079b9	Toto's Football Adventure	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-22 13:51:36.07	2025-11-04 08:27:09.785	339ac7a8-1340-41f1-a6f9-5642c8e079b9/41e09cde-e274-4f61-8d78-c512fecf8dcb.png	4-5	cartoon	t	{friendship,bedtime}	f
4a323aaf-4147-450e-ba37-241fbbf41363	Lucie in space	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-22 15:37:46.301	2025-11-04 09:22:35.343	4a323aaf-4147-450e-ba37-241fbbf41363/16f954d2-b172-488f-aada-2f534df65f94.png	10-12	cartoon	t	{education,magic,bedtime}	f
8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	Maceo's Firefighting Dream	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-25 17:12:59.192	2025-11-04 09:22:35.343	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/14d1a339-c42e-4e4b-9381-56745c6c4965.png	6-7	cartoon	t	{education,bedtime}	f
3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	Salma's Stray Cat Shelter	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-30 21:26:59.724	2025-11-05 13:21:10.486	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/97079ac2-4353-4c21-8c09-88de40b10e1f.png	10-12	anime	t	{hero,bedtime,friendship}	f
0b2fcec3-20a0-4086-80e4-95aed4622f53	The Adventures of Super Georges	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-30 21:54:16.712	2025-11-05 21:48:05.721	0b2fcec3-20a0-4086-80e4-95aed4622f53/b06881ed-5c29-4d81-a3e7-6b3dbd965ff5.png	2-3	line-art	t	{hero,adventure,friendship}	f
d139ddd9-5dc3-4731-874e-98a5a1760a1e	The Jedi Apprentice	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-11-06 21:52:45.616	2025-11-06 21:55:02.858	d139ddd9-5dc3-4731-874e-98a5a1760a1e/93d175c5-dcdb-42a6-8c1c-e2ca297aa413.png	13+	comics	t	{hero,adventure,magic}	f
e69e74db-27b5-415f-a41f-7c880198922c	Eliot's Big Giveaway	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-11-06 21:56:43.446	2025-11-06 21:58:50.498	e69e74db-27b5-415f-a41f-7c880198922c/f32fd184-a151-4e74-8451-68e378c5f327.png	4-5	anime	t	{education,bedtime}	f
729b47b3-be07-4d80-9ef3-c2f411e1d7e4	Yoyo's Math Adventure	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-31 15:20:58.24	2025-11-06 20:12:58.892	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/56dbe2d6-e353-490e-880c-bb63d2830ec5.png	13+	cartoon	t	{education}	f
35952da4-62ba-47de-be2e-113ee7444c18	The Jungle Quest	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-10-30 19:46:32.068	2025-11-06 21:20:55.572	35952da4-62ba-47de-be2e-113ee7444c18/c1ac28f3-40f2-4f69-a994-675f5516ad6a.png	6-7	anime	t	{adventure,magic}	f
8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	Romain's Adventure in Thailand	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-11-06 22:03:58.646	2025-11-06 22:06:07.258	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/dd8daa2c-29cc-4681-a2f5-ee7a61986ac4.png	6-7	cartoon	t	{adventure,friendship}	f
c17ccc6b-9159-4418-af07-0274e63ae070	Lina's Magical Maze Adventure	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-11-06 22:17:43.655	2025-11-06 22:20:54.001	c17ccc6b-9159-4418-af07-0274e63ae070/cf7fa68d-031a-4448-8957-85e8fccf51a9.png	13+	anime	t	{adventure,magic,bedtime}	f
1040f798-43f9-4f99-8d5f-9c63c2e25c30	Zara the Brave Knight	64488f3a-0beb-40cc-882b-c458d0725a7e	2025-11-06 22:25:57.126	2025-11-06 22:28:16.417	1040f798-43f9-4f99-8d5f-9c63c2e25c30/121a2555-bb27-4e04-9731-31d711841b7a.png	8-9	anime	t	{hero}	f
\.


--
-- Data for Name: Page; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Page" (id, text, "bookId", "createdAt", "updatedAt", color, image, number) FROM stdin;
43cfc976-d652-4861-89a3-d55dd39d43a3	George, a 13-year-old boy with olive skin, black hair, and green eyes, had always been fascinated by the tales of the legendary explorer Indiana Jones. He dreamed of embarking on his own thrilling adventures, uncovering ancient mysteries and valuable treasures.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:46:48.566	2025-10-30 19:46:48.566	#FFE4E1	35952da4-62ba-47de-be2e-113ee7444c18/8e5d1f38-42da-4c6c-a138-173e5dc52a53.png	1
09ae3460-3d64-4f75-bdde-cede9c81a8ca	One day, George heard whispers of a legendary ruby hidden deep within the Amazon rainforest. Without hesitation, he packed his gear and set out on a journey to find the elusive gem, determined to follow in the footsteps of his hero.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:47:05.01	2025-10-30 19:47:05.01	#F5F0FF	35952da4-62ba-47de-be2e-113ee7444c18/d7bc91a9-6340-48e3-8c47-92313624a0c8.png	1
ec3fdd5b-8038-4cd6-b9ab-17a6ced352c6	The trek through the dense jungle was arduous, with George constantly battling the relentless heat, humidity, and the occasional pesky insect. But his determination never wavered, fueled by the prospect of uncovering the ruby and proving his worth as an adventurer.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:47:26.966	2025-10-30 19:47:26.966	#FDF5E6	35952da4-62ba-47de-be2e-113ee7444c18/5347f1d3-4e48-46e0-acc7-be621467f553.png	1
3ba937c3-ce65-479c-a159-0ac6f0d05d4b	After days of trekking, George finally stumbled upon an ancient temple, its crumbling walls hinting at the secrets it held. Excitement surging through him, he cautiously approached the entrance, ready to face whatever challenges lay ahead.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:47:48.23	2025-10-30 19:47:48.23	#FFFACD	35952da4-62ba-47de-be2e-113ee7444c18/ec46157a-e5e2-475a-8420-b445918d3076.png	1
2334b74c-4ef2-4dcc-80b6-e2448ce104c3	After reading the book, Toto went outside to practice dribbling the football. He worked hard, trying to control the ball and keep it close to his feet.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:52:12.607	2025-10-30 14:51:07.314	#F5F5DC	339ac7a8-1340-41f1-a6f9-5642c8e079b9/a49a2a0d-b7b9-4489-b6bd-b34c06d42207.png	1
0378ee34-a933-4ee1-8562-9f53dcbccf89	Toto practiced his shooting too, trying to score goals. He was determined to become a great football player.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:52:31.609	2025-10-30 14:51:07.474	#E0FFFF	339ac7a8-1340-41f1-a6f9-5642c8e079b9/3fc6996b-ffc6-44f0-8cfb-3241d66e2a26.png	1
4d289f5c-dc6c-4d7f-b145-82c463e78bbf	One day, Toto's school had a football match. Toto was nervous, but he ran onto the field and started dribbling the ball towards the goal.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:52:59.049	2025-10-30 14:51:07.795	#FAF0E6	339ac7a8-1340-41f1-a6f9-5642c8e079b9/0cd7af67-f948-4d25-b484-5a4f9605c8aa.png	1
dc7611e2-6899-476f-a7a3-c5c41d98fdb8	Toto kicked the ball and scored a goal! His teammates were so proud of him. Toto had worked hard, and it had paid off.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:53:12.207	2025-10-30 14:51:07.956	#F0FFF0	339ac7a8-1340-41f1-a6f9-5642c8e079b9/11ee852b-d93c-4d5a-99b1-ff2631eba888.png	1
433d25e4-ae64-467b-aa27-c23745d96475	After the match, Toto's team celebrated their victory. Toto felt proud of himself for learning to play football so well.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:53:24.901	2025-10-30 14:51:08.115	#F8F8FF	339ac7a8-1340-41f1-a6f9-5642c8e079b9/c5c193ed-88d4-442b-aac9-0cb7ed8bfa1a.png	1
bb6bd11c-f7c4-4199-b40a-891c8d577bca	Toto's hard work paid off, and he became one of the best players on his team. He loved the excitement of scoring goals and winning matches.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:53:53.221	2025-10-30 14:51:08.437	#F0FFF8	339ac7a8-1340-41f1-a6f9-5642c8e079b9/d1efd5df-a434-4fbb-ba5a-e37e1595b02a.png	1
de78fc25-d7e2-4bcf-b2ed-d8de74afb446	Finally, Toto's team won a big football tournament. Toto was so proud to hold the trophy high, surrounded by his friends. He had come a long way from that day when he didn't know how to play football.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:54:05.182	2025-10-30 14:51:08.597	#F0E68C	339ac7a8-1340-41f1-a6f9-5642c8e079b9/a09f8c12-cfa8-4cd3-98b9-5be45ef80e63.png	1
1ba50afe-3ea1-4a88-a1e0-8781375ff43a	Lucie loved looking up at the night sky and dreaming of going to space. She would spend hours drawing rocket ships and imagining what it would be like to float in zero gravity.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:37:58.555	2025-10-30 14:51:08.755	#F5F5DC	4a323aaf-4147-450e-ba37-241fbbf41363/6d26e905-19ca-4355-88ac-8bc635d41436.png	1
23699c85-5418-45fb-a76e-7df62c992629	Lucie threw herself into learning everything she could about space and astronomy. She read every book she could find, did experiments in her room, and even started taking extra science classes at school.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:38:24.675	2025-10-30 14:51:09.073	#FFF8F0	4a323aaf-4147-450e-ba37-241fbbf41363/4db6981c-ba79-45ed-b908-fd816a883334.png	1
9a63348c-6f28-419b-9b39-51159fbbfee6	Lucie's parents took her to visit a space museum, where she was able to talk to a real astronaut. The astronaut answered all of her questions and told her about the hard work and dedication it took to become an astronaut.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:38:36.997	2025-10-30 14:51:09.235	#F0FFFF	4a323aaf-4147-450e-ba37-241fbbf41363/be467bae-0587-4189-852b-10032942328b.png	1
b0c34a0b-dd1e-499f-8400-061a6ad8ac52	With her parents' support, Lucie applied to a prestigious space camp program. To her delight, she was accepted and spent an incredible week learning about the ins and outs of being an astronaut.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:38:49.494	2025-10-30 14:51:09.395	#F5FFFA	4a323aaf-4147-450e-ba37-241fbbf41363/652e6e2d-bc23-45ad-9a4c-5aac0de048b6.png	1
39ca793a-ca2a-4c92-959b-7473df6b9a8f	The launch was a success, and Lucie found herself floating weightlessly in the space station, gazing out at the Earth below. She had never felt more alive or more in awe of the beauty of our planet.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:39:12.723	2025-10-30 14:51:09.713	#FFF5EE	4a323aaf-4147-450e-ba37-241fbbf41363/d068dc46-ccfe-4e81-8500-5fd857cac70a.png	1
1bc7c96c-079a-468c-9bbb-6e9aa45d9b53	After her mission was complete, Lucie returned to Earth, where she was greeted by her family and friends. They were all so proud of her and the incredible accomplishment she had achieved.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:39:24.623	2025-10-30 14:51:09.873	#FFF5F5	4a323aaf-4147-450e-ba37-241fbbf41363/74dda45b-f969-4ffe-a7dd-8bd8ac0d59e9.png	1
8dc979fe-7a61-4d5a-8b3e-17e46741888d	Lucie didn't stop there, though. She became a passionate advocate for space exploration and inspiring the next generation of astronauts. She spoke to countless children about her experiences and encouraged them to pursue their own dreams, no matter how big they might be.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:39:40.919	2025-10-30 14:51:10.033	#FFF0F0	4a323aaf-4147-450e-ba37-241fbbf41363/888b7080-b25a-48e3-95ee-17bae8917119.png	1
30f522b9-ea1d-4456-99e5-a391ac5b6448	As Lucie looked up at the stars, she couldn't help but feel a sense of wonder and excitement for the future. She knew that her journey as an astronaut was just the beginning, and she couldn't wait to see what other adventures awaited her among the stars.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:39:55.399	2025-10-30 14:51:10.197	#FFF8DC	4a323aaf-4147-450e-ba37-241fbbf41363/a942b854-075a-4780-b754-04d971da4c2c.png	1
e8994a3d-7c9d-4f38-bfa6-6bf92a8f6cab	Georges didn't just use his powers to fight bad guys. He also loved to play with his friends, showing off his amazing abilities and making them laugh.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:56:10.355	2025-10-30 21:56:10.355	#FFF8DC	0b2fcec3-20a0-4086-80e4-95aed4622f53/ccdf74f4-8f53-4ba1-9568-efcaf7216a81.png	1
2080a949-2994-4d73-b714-66f797fcbdf6	Even with all his exciting adventures, Georges never forgot to use his powers to help the people in his community. He would often lend a hand to those in need, whether it was helping an old lady cross the street or lifting heavy boxes for a struggling family.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:56:24.571	2025-10-30 21:56:24.571	#F0FFF0	0b2fcec3-20a0-4086-80e4-95aed4622f53/63fed7df-c632-4b83-8aac-3885b5897700.png	1
db520d49-0013-49b8-8c98-cec4220a75e9	The people in Georges' city were so grateful for their young superhero that they even invited him to speak at the local school. The children were amazed to hear about his adventures and asked him all sorts of questions about his powers.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:56:40.89	2025-10-30 21:56:40.89	#F0FFF0	0b2fcec3-20a0-4086-80e4-95aed4622f53/1f45c496-94ab-4b7b-9c3d-a23c25192b1b.png	1
a685daf5-a2ce-4a99-88ff-a1e77d809a8e	As the sun set on another day, Georges knew that he would always be ready to use his powers to protect his city and help the people he loved. Being a superhero was the best job in the world!	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:56:55.934	2025-10-30 21:56:55.934	#FFF5EE	0b2fcec3-20a0-4086-80e4-95aed4622f53/31f860dd-cf0d-4fc2-a1fc-68813624f043.png	1
3ad20b10-291e-43d7-be4b-e2395c372d4b	Wow, look at all those cool yoyo tricks! Yoyos are great for practicing things like balance and concentration, which are also helpful for doing math. Let's try a few simple yoyo tricks together now.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:22:47.33	2025-10-31 15:22:47.33	#F0FFF8	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/b328dd3d-a141-4d30-8afa-6b828277570b.png	1
be5b6627-fd11-481c-88dc-c14700f5c746	Excellent work, class! I can see you've all been practicing your addition skills. You should be very proud of yourselves. Keep up the great work, and we'll move on to even more fun math topics next time.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:23:00.274	2025-10-31 15:23:00.274	#E6E6FA	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/24903eb5-e024-4ec7-9a8f-ea68674bfc69.png	1
c96fda15-f99e-4a50-a248-78532cd7aa93	Yay, we did it! You all learned so much about addition today. I'm so proud of you for working hard and having fun with math. Let's give ourselves a big round of applause! I can't wait to see what we'll learn next time.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:23:15.8	2025-10-31 15:23:15.8	#F0FFF0	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/1a831365-9f71-4157-bba6-fa3f17e879a1.png	1
c8d77ffb-a1ea-498f-8fbc-c4749ba411f4	Alright class, that's all for today. Remember to keep practicing your addition at home, and I'll see you next time for more exciting math adventures with Yoyo! Bye bye!	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:23:31.74	2025-10-31 15:23:31.74	#FFF0F5	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/9caefcb3-27e1-403b-bde8-2d36a83750d5.png	1
714085ba-76c5-4af8-939a-3e27c3900691	Maceo had always been fascinated by firefighters. He loved watching the big red fire trucks race down the street, sirens blaring, and imagining what it would be like to be the one driving them.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:13:12.458	2025-10-30 14:51:13.224	#E6E6FA	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/a13a96c0-c47e-40d8-a54f-ae068e1b20cb.png	1
b4cadb57-87e5-4fa6-8f27-bc0947f1d0b1	One day, Maceo's class took a field trip to the local fire station. As they toured the building, Maceo was in awe of all the equipment and the brave firefighters who used it to keep the community safe.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:13:28.356	2025-10-30 14:51:13.383	#FFF8F0	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/5eea5e79-34dc-4fdb-92d9-50f24988fdc7.png	1
eed87b86-3228-411a-948d-0e1ca0e5ee81	From that day on, Maceo knew exactly what he wanted to be when he grew up. He spent hours drawing pictures of firefighters and reading books about their heroic deeds.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:13:49.501	2025-10-30 14:51:13.703	#FFF5F5	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/b9dff553-2e2e-496f-b44d-d83f1807bb62.png	1
006158db-4bc4-48f3-909d-63707a5199cb	Maceo's parents could see how passionate he was about becoming a firefighter. They encouraged his dreams and even helped him make a firefighter's uniform out of old clothes and cardboard.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:14:01.129	2025-10-30 14:51:13.863	#F5F5DC	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/4a5247f0-08cc-4852-bceb-b6785a7107cc.png	1
6fbe38db-dece-4cff-886b-989142ee19db	Maceo practiced his firefighting skills every chance he got. He learned how to use a fire extinguisher, tie knots, and even practiced sliding down a pole like the real firefighters.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:14:13.409	2025-10-30 14:51:14.022	#E0FFFF	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/1e66920d-763b-49a9-bdbf-4f27c451ca07.png	1
8e15c079-205e-4b4b-8b85-ddb8984f4767	One day, Maceo's parents took him to the fire station to meet the firefighters. He was thrilled to be able to sit in the fire truck and even practice using the hose.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:14:27.036	2025-10-30 14:51:14.181	#F0FFF0	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/32b4ced6-4fa4-47be-b442-ccbc2164107e.png	1
24d0e696-3e8b-4e05-8ca7-064e8a8fdd1f	As Maceo got older, his dream of becoming a firefighter only grew stronger. He knew that it would take a lot of hard work and dedication, but he was more than ready to take on the challenge.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:14:50.875	2025-10-30 14:51:14.499	#FFF8F0	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/87361a42-f84c-48b3-a010-084361678dc7.png	1
b51f6162-bf6d-40e8-b86c-0f3bb8318d66	And one day, Maceo's dream came true. He graduated from the fire academy and became a full-fledged firefighter, ready to keep his community safe and make a difference in the world.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:15:02.49	2025-10-30 14:51:14.658	#F0FFF8	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/78b40fc0-c65a-497d-b8cd-c9c2d3c2849c.png	1
e94a24c2-4bba-4745-ac3b-9eed4d12b459	Carefully making his way through the temple, George encountered a series of perilous traps and puzzles, reminiscent of the challenges faced by his idol, Indiana Jones. With his quick wit and nimble reflexes, he managed to overcome each obstacle, inching closer to his goal.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:48:03.384	2025-10-30 19:48:03.384	#FFF8F0	35952da4-62ba-47de-be2e-113ee7444c18/538ad174-3598-43cc-9419-ec37f4774a12.png	1
675e29f4-844a-4a77-8218-7774bb471d08	At last, George reached the inner sanctum of the temple, where a breathtaking sight awaited him. There, on a ornate pedestal, lay the ruby, its crimson hue glimmering in the faint light. Overcome with a sense of triumph, George reached out to claim his prize.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:48:18.213	2025-10-30 19:48:18.213	#FFFACD	35952da4-62ba-47de-be2e-113ee7444c18/52422764-3084-422b-b2eb-76980a766d55.png	1
e1183c40-cb98-4dbf-bb25-1b0f1d66b184	But just as George's fingers closed around the ruby, the temple began to shake and tremble. Realizing he had triggered a ancient mechanism, he quickly turned and dashed towards the exit, narrowly escaping as the temple collapsed behind him.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:48:35.232	2025-10-30 19:48:35.232	#FFF0F0	35952da4-62ba-47de-be2e-113ee7444c18/71ed72d4-d5e9-474f-88e3-7f6a2e41ccf5.png	1
2e6c0072-3c27-46a0-9f3b-069f1dc867f9	Toto loved to play football, but he didn't know how. He decided to learn all about the game by reading a book.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:51:54.86	2025-10-30 14:51:06.996	#FFF8DC	339ac7a8-1340-41f1-a6f9-5642c8e079b9/bff1c10d-64c1-42b4-9bd7-c9ec469ee0b9.png	1
56b21892-8315-4edd-9318-04998d8b0f51	Toto's friend came over, and they started playing a game of football together. Toto was getting better at passing and teamwork.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:52:46.686	2025-10-30 14:51:07.634	#FFF0F5	339ac7a8-1340-41f1-a6f9-5642c8e079b9/5d3a39b2-aaca-4a15-86c3-a755375aba75.png	1
a91a2662-63fa-4647-ad94-1450adb5cf7d	From then on, Toto played football with his friends whenever he could. He loved the game and was getting better and better at it.	339ac7a8-1340-41f1-a6f9-5642c8e079b9	2025-10-22 13:53:40.063	2025-10-30 14:51:08.277	#F8FFF8	339ac7a8-1340-41f1-a6f9-5642c8e079b9/f0a96573-983d-46e1-a931-f7abb57aa896.png	1
56d7b001-120d-4bf4-9db0-1cdb8ad3e0fe	One day, Lucie gathered the courage to tell her parents about her dream of becoming an astronaut. At first, they were surprised, but then they saw the excitement in her eyes and promised to support her in any way they could.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:38:12.841	2025-10-30 14:51:08.914	#F5F5DC	4a323aaf-4147-450e-ba37-241fbbf41363/0dd47b55-effe-4b9c-a921-bee1818559f2.png	1
cd55387e-6ca5-4662-8d7e-2c9ccaeedcc9	After years of hard work and dedication, Lucie's dream finally came true. She was selected for a coveted spot on a mission to the International Space Station. As she stood in front of the rocket, suited up and ready for launch, she couldn't believe her eyes.	4a323aaf-4147-450e-ba37-241fbbf41363	2025-10-22 15:39:00.889	2025-10-30 14:51:09.554	#F0F8FF	4a323aaf-4147-450e-ba37-241fbbf41363/8de29030-4d38-4fd7-99e2-f106a68e7feb.png	1
d9a38e48-2b81-4287-9326-b8f9db40998a	Bruised and weary, but with the ruby safely in his possession, George emerged from the jungle, his dream of adventure fulfilled. As he gazed upon the glittering gem, he knew this was only the beginning of his journey as a fearless explorer.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:48:53.313	2025-10-30 19:48:53.313	#F5FFFA	35952da4-62ba-47de-be2e-113ee7444c18/f00d80df-2512-4864-a54c-c3210d206e0d.png	1
6158af2d-538d-46b1-bec9-21daa5faf3ab	News of George's remarkable feat quickly spread, and he was hailed as a hero by his community. With the ruby in his hands, he now had the means to continue his quest for adventure, eager to uncover more of the world's ancient secrets.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:49:10.024	2025-10-30 19:49:10.024	#FFF8F0	35952da4-62ba-47de-be2e-113ee7444c18/0892bafe-ebfd-4ca6-8fd0-7edd48accba6.png	1
f1d0db20-de38-4052-bce7-ed8166fdd23f	As he set his sights on the horizon, George knew that his journey was far from over. The thrill of discovery and the lure of the unknown fueled his spirit, and he was ready to embark on many more daring adventures, just like his idol, Indiana Jones.	35952da4-62ba-47de-be2e-113ee7444c18	2025-10-30 19:49:23.765	2025-10-30 19:49:23.765	#FFFFF0	35952da4-62ba-47de-be2e-113ee7444c18/b2a17682-98af-4ef2-a557-409ce799bed1.png	1
f07314a2-f473-4228-b1bd-f0163a239aae	Every day, Salma felt fulfilled knowing that she was making a difference in the lives of these stray cats. She had found her true calling, and she was more determined than ever to continue her mission of providing a safe haven for animals in need.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:29:47.165	2025-10-30 21:29:47.165	#E6E6FA	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/b1cf2978-e1ba-49f9-8270-a86b5c57a3a3.png	1
24993334-ba70-4902-97c2-656a89f2193b	Hi, my name is Yoyo! I'm going to teach you some basic math today. Math is really fun and important to learn. Let's start with addition. Addition is when we put two numbers together to get a new number. We can do addition with small numbers, like 2 + 3. What do you think the answer is?	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:21:12.506	2025-10-31 15:21:12.506	#F5F5DC	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/cc500b63-dff7-4124-b839-acaea7dafe07.png	1
5f7d137d-3551-4a8a-8b9d-449a8ee350a6	Great job! The answer is 5. Let's try another one. If I have two blocks and I add three more blocks, how many blocks do I have altogether? Go ahead and count the blocks with me.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:21:28.588	2025-10-31 15:21:28.588	#FAF0E6	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/abef1d06-58c6-4f70-a77d-585b684b607d.png	1
00ac436d-4788-46b8-8473-e3509d09c18c	Excellent! You're a natural at addition. Now let's try some more problems on this worksheet. Remember, for addition, we just need to count all the things together to get the answer.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:21:44.206	2025-10-31 15:21:44.206	#F8F8FF	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/88415bae-36e4-4101-9eea-ce60317a08e6.png	1
0f64d67d-2d9b-4e8d-846b-b7b0e2a76489	Okay class, let's review what we've learned about addition so far. Can anyone tell me the answer to 4 + 2? How about 1 + 5? Great job, you're all doing so well!	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:22:01.55	2025-10-31 15:22:01.55	#F0E68C	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/b97cf6c7-b434-4b7f-b54d-679700841b3f.png	1
45958b8e-a43e-4f74-b3bb-6a69abfe41f2	Now it's your turn to practice. Let's work through some addition problems in this workbook. I'll be here to help if you get stuck on any of them.	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:22:19.819	2025-10-31 15:22:19.819	#F8F8FF	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/0a614da8-9674-4d4e-897d-72307964fdee.png	1
fc3d28f0-0cd4-4eb2-930a-473f0064c572	Alright class, let's take a quick break from our math work. Who wants to see me do some yoyo tricks? Yoyos can be really fun and help us practice our hand-eye coordination, which is important for math too!	729b47b3-be07-4d80-9ef3-c2f411e1d7e4	2025-10-31 15:22:34.021	2025-10-31 15:22:34.021	#E6E6FA	729b47b3-be07-4d80-9ef3-c2f411e1d7e4/7a25ffe0-56b1-4363-bfd7-975ec06bf4ba.png	1
6e84b538-015b-4c50-aa9e-5810fa591c40	The firefighters were so kind and took the time to explain their jobs to the children. Maceo was thrilled when one of the firefighters let him try on the heavy jacket and helmet.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:13:39.748	2025-10-30 14:51:13.544	#F5FFFA	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/480053e9-e25d-4433-b77f-f0d78a3509f3.png	1
73d82d90-526d-4d2a-b58c-556aee39a83b	The firefighters were impressed by Maceo's enthusiasm and eagerness to learn. They let him help wash and polish the fire truck, which Maceo thought was the best day ever.	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7	2025-10-25 17:14:40.786	2025-10-30 14:51:14.34	#F8FFF8	8fd5a0cf-b976-4641-ab0d-ef33dfe7c7d7/400bd4a6-04f7-4c83-bf10-4e56409436ed.png	1
18da68cb-d733-49f3-afce-256b6782a1f5	Salma was a 13-year-old girl with a big heart. Every night, she would look out her window and see the stray cats in her neighborhood shivering in the cold. She wished she could do something to help them.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:27:17.926	2025-10-30 21:27:17.926	#FAF0E6	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/2b6e49a8-175e-4fce-9793-450d313ac586.png	1
5d9dd821-e1fc-4f6f-a444-a2ae8fb41984	Salma's dream had become a reality. Thanks to her hard work and the support of her parents, the stray cats in her neighborhood now had a warm, safe place to call home. Salma couldn't wait to see how many more lives she could change in the years to come.fff	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:29:30.429	2025-11-05 14:22:23.157	#F0F8FF	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/f19d34a1-44f1-49c9-805e-a33d2051cdaa.png	1
ae55c11c-5953-472c-95a6-cc0110b24f01	Over the next few weeks, Salma and her parents worked tirelessly to clean and renovate the old building. They built cozy cat beds, set up food and water bowls, and made sure the space was warm and welcoming for their future feline residents.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:28:06.686	2025-10-30 21:28:06.686	#FFEFD5	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/c4aadf39-a482-4417-80b2-b214515f3b52.png	1
e55831c3-e843-4ff4-8564-45bc28dfdec6	Salma spent every day at the shelter, caring for the cats and making sure they were safe and comfortable. She played with them, brushed their fur, and gave them all the love and attention they deserved.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:28:45.208	2025-10-30 21:28:45.208	#F0E68C	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/5b7af0c7-ba74-416d-abb2-6859930b6048.png	1
6b8bdd97-8d2d-4a4e-8e2e-f2d7d2f58c9a	As word spread about Salma's wonderful cat shelter, people in the community started to visit, looking to adopt the stray cats. Salma was thrilled to match each cat with a loving family who would give them a forever home.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:28:59.354	2025-10-30 21:28:59.354	#FAF0E6	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/71f1e888-fa4e-44a5-8e4f-2a01f8059dbd.png	1
39b646d0-aac0-4e5d-af41-a7ef2ca87d3a	Seeing the cats go to their new homes filled Salma's heart with joy. She knew that each adoption meant one more stray cat had found a loving family to call their own.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:29:16.197	2025-10-30 21:29:16.197	#F8FFF8	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/e64df537-8e4b-4a79-ad10-2b1de953bd3c.png	1
5f99c2e2-0f55-44c8-824d-c4e86344a6be	Georges was a special little boy. Unlike other kids, he had amazing superpowers! He could fly, shoot laser beams from his hands, and even see through walls.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:54:31.876	2025-10-30 21:54:31.876	#FFF8DC	0b2fcec3-20a0-4086-80e4-95aed4622f53/071c4a6c-1949-48a3-9432-6c14f2acd98a.png	1
aba2d776-aa35-443a-95ac-08cc80cb7c90	One day, while Georges was playing outside, he noticed strange-looking spaceships hovering over the city. He knew he had to do something to protect his home.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:54:45.414	2025-10-30 21:54:45.414	#F0E68C	0b2fcec3-20a0-4086-80e4-95aed4622f53/ee871813-2fa9-4fd1-8c3d-427e0139a8cf.png	1
cf13b5aa-1d12-4f13-9529-be41a2ab19c3	Georges quickly flew up to the spaceships and started using his laser beams to blast them out of the sky. The aliens tried to shoot back, but Georges was too fast and too strong for them.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:55:05.516	2025-10-30 21:55:05.516	#FFE4E1	0b2fcec3-20a0-4086-80e4-95aed4622f53/26be2aed-26fc-4a7c-99d8-c5719d4cdb7c.png	1
54d75edc-86e2-488f-9b81-77b227093d81	While fighting the aliens, Georges also made sure to rescue the people in the city. He carefully carried them to safety, using his super strength to move heavy debris and rubble out of the way.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:55:23.457	2025-10-30 21:55:23.457	#FFF0F0	0b2fcec3-20a0-4086-80e4-95aed4622f53/63d5a757-9481-49d5-8349-3558cef1d2ce.png	1
6ecf1745-6285-4148-a93a-255f983d8aef	After a long battle, Georges managed to defeat all the aliens and save the city. The people cheered and celebrated their hero, the amazing Super Georges!	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:55:39.102	2025-10-30 21:55:39.102	#FAF0E6	0b2fcec3-20a0-4086-80e4-95aed4622f53/486b1fdf-da83-4a9b-bc88-65a50949e5c7.png	1
8347c116-79d0-41d7-b035-ea8eca7dac0f	When the excitement was over, Georges returned home, happy to have used his powers to help others. He knew that being a superhero was hard work, but he was glad he could make a difference in his city.	0b2fcec3-20a0-4086-80e4-95aed4622f53	2025-10-30 21:55:55.671	2025-10-30 21:55:55.671	#FFE4E1	0b2fcec3-20a0-4086-80e4-95aed4622f53/65537694-5470-4471-8380-2f9dfbd8db59.png	1
f7d0ca7c-73f3-46df-9e8c-3a0b7d44d9f1	Salma spent every day at the shelter, caring for the cats and making sure they were safe and comfortable. She played with them, brushed their fur, and gave them all the love and attention they deserved.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:28:24.289	2025-11-05 13:34:08.574	#FFF5F5	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/31d3fd9c-7ce8-4159-b475-6e4017f57301.png	1
986c35e5-4c11-431b-8ffd-555700fbb848	Salma's parents listened closely as she shared her plan. They were impressed by her compassion and agreed to help her find a suitable building to use as a cat shelter.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:27:50.376	2025-11-05 13:43:00.88	#F5FFFA	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/253051aa-ef1a-4c1c-9420-8aed2180cbe6.png	1
770d6c91-af47-4c27-b2b0-d32ac8e725e1	One evening, Salma gathered the courage to talk to her parents about her idea. 'Mom, Dad, I want to open a shelter for all the stray cats in our neighborhood! They need a warm, safe place to stay,' she said.	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2	2025-10-30 21:27:35.406	2025-11-05 13:44:34.588	#FFF5F5	3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/455d73ae-a250-45c0-b4be-c14a4a4d9a42.png	1
7686210a-5ed6-4866-8408-02504d3fad57	Raphaël was a 13-year-old boy training to become a Jedi knight under the tutelage of Master Adam. Though he was eager to learn, Raphaël sometimes struggled to focus during his lessons, his mind often wandering to dreams of adventure and heroic battles.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:52:58.826	2025-11-06 21:52:58.826	#FFE4E1	d139ddd9-5dc3-4731-874e-98a5a1760a1e/40d0a0db-3d25-44dc-a6e8-e6d815197877.png	0
b0955c17-332f-40eb-9cd7-b525ab06d293	Each day, Raphaël spent hours honing his skills with the lightsaber, determined to become as powerful and skilled as his master. He knew that mastering the weapon was crucial for any Jedi, as they often found themselves in dangerous situations requiring quick reflexes and intense focus.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:53:11.529	2025-11-06 21:53:11.529	#E0FFFF	d139ddd9-5dc3-4731-874e-98a5a1760a1e/833a603b-4a53-479e-aef1-175879fc9c4f.png	1
402c4b10-e245-48ff-8756-c553e40fe165	One day, Master Adam received an urgent call for help from a distant planet. Without hesitation, he and Raphaël boarded their Jedi starship and set off on a perilous journey through the galaxy, ready to face whatever challenges lay ahead.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:53:26.467	2025-11-06 21:53:26.467	#FAF0E6	d139ddd9-5dc3-4731-874e-98a5a1760a1e/8a4015ea-4003-4233-9598-8f7a7a6068b8.png	2
e5966ea3-8ba5-47fc-ab50-28e38c348711	Upon arriving at the planet, Raphaël and Master Adam discovered that a powerful criminal organization had taken control of a valuable Jedi relic. The duo knew they had to retrieve the artifact before it fell into the wrong hands, but first, they would have to fight their way past the alien guards.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:53:41.086	2025-11-06 21:53:41.086	#F5F5DC	d139ddd9-5dc3-4731-874e-98a5a1760a1e/a8ec6ae4-b892-417f-999a-c8b2ce18540c.png	3
e1409510-7021-4309-a1e1-ea22ae6a9197	The battle was intense, with Raphaël and Master Adam using their agility and lightsaber skills to fend off the relentless onslaught of the alien guards. Raphaël felt his heart race as he fought alongside his master, determined to prove his worth as a Jedi.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:53:55.286	2025-11-06 21:53:55.286	#FFE4E1	d139ddd9-5dc3-4731-874e-98a5a1760a1e/f5f7ecfc-bd61-4e2c-a538-206265aa0731.png	4
8f5ec4bc-7e6f-447b-a31b-97a9d3f1d924	After a hard-fought battle, Raphaël and Master Adam emerged victorious, reclaiming the valuable Jedi relic. Raphaël felt a surge of pride and confidence, knowing that he had played a crucial role in their success. He could see the approval in Master Adam's eyes, and he vowed to continue training diligently to become a true Jedi knight.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:54:09.126	2025-11-06 21:54:09.126	#FFF8DC	d139ddd9-5dc3-4731-874e-98a5a1760a1e/08fec333-8779-4393-bc55-3c8b4ba09ff6.png	5
25773c40-7fc2-49ca-87a9-b1c2f78abc43	Upon returning to the Jedi Temple, Raphaël and Master Adam reported their success to the Jedi Council. The Council members were impressed by Raphaël's bravery and skill, and they commended him for his dedication to the Jedi way. Raphaël felt a renewed sense of purpose, knowing that he was on the right path to becoming a powerful and respected Jedi knight.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:54:23.026	2025-11-06 21:54:23.026	#FFF0F5	d139ddd9-5dc3-4731-874e-98a5a1760a1e/d2caa4a8-ae26-4c6a-a9df-812b24c63771.png	6
a1472cd4-5ac1-4a85-bf88-c74f40dfc1fc	In the days that followed, Raphaël spent countless hours in meditation, deepening his connection to the Force and honing his inner discipline. He knew that becoming a Jedi was not just about mastering the physical skills of combat, but also about developing a strong and balanced mind and spirit.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:54:35.686	2025-11-06 21:54:35.686	#E6E6FA	d139ddd9-5dc3-4731-874e-98a5a1760a1e/ead12a2c-8761-4bd4-8f9f-29423a72b4a0.png	7
913198a4-456d-411f-afda-6928fcc9046a	As Raphaël's training progressed, he and Master Adam continued to embark on new missions, facing ever-greater challenges and threats to the peace and stability of the galaxy. Raphaël knew that the path of the Jedi was not an easy one, but he was more determined than ever to prove himself worthy of the title.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:54:49.406	2025-11-06 21:54:49.406	#FFFFF0	d139ddd9-5dc3-4731-874e-98a5a1760a1e/9b1583ed-501c-40c9-8126-7a3ca44c6dbf.png	8
d578a110-48c0-4b1b-9081-3febd7064f46	And so, Raphaël's journey as a Jedi apprentice continued, filled with adventure, danger, and the constant pursuit of knowledge and wisdom. He knew that one day, he would stand alongside the greatest Jedi knights, ready to protect the galaxy from the forces of darkness. With unwavering determination and the guidance of his master, Raphaël was well on his way to becoming a true Jedi hero.	d139ddd9-5dc3-4731-874e-98a5a1760a1e	2025-11-06 21:55:02.766	2025-11-06 21:55:02.766	#F5FFFA	d139ddd9-5dc3-4731-874e-98a5a1760a1e/eed903d8-c88c-4877-b2f9-a98ea07474c2.png	9
74910e50-8778-4671-bbd5-b2ee87ad3846	Eliot was a 4-year-old boy with black hair and brown eyes. He lived in Las Vegas with his family. One day, Eliot won a super jackpot at the casino! He was so excited to have all that money.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:56:56.826	2025-11-06 21:56:56.826	#FFF5EE	e69e74db-27b5-415f-a41f-7c880198922c/31ccaff8-3be3-40a4-88cb-734fc82a1021.png	0
1216a106-0e1e-42ad-b18c-2fa6e2d49998	But Eliot didn't want to keep all the money for himself. He wanted to use it to help others. Eliot asked his parents if he could give the money to charity.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:57:09.626	2025-11-06 21:57:09.626	#FFFAF0	e69e74db-27b5-415f-a41f-7c880198922c/f5c47bd2-b605-42e4-b812-3287cadec768.png	1
d36f07a1-6c28-4c4f-8ae9-73af77d04822	His parents were so proud of him. They said Eliot could give the money to any charity he wanted. Eliot thought hard about which charities would help the most people.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:57:22.566	2025-11-06 21:57:22.566	#F8F8FF	e69e74db-27b5-415f-a41f-7c880198922c/6b5ff2d9-1028-4ee9-92d8-c9f52903e734.png	2
55ac6617-7505-4171-9dfe-b882688d0a02	Eliot decided to split the money between three charities - one that helped homeless families, one that gave school supplies to kids in need, and one that cared for sick animals.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:57:34.785	2025-11-06 21:57:34.785	#E0FFFF	e69e74db-27b5-415f-a41f-7c880198922c/485ba5b3-c526-4cdb-a434-91e87cb198d7.png	3
4d437834-a9e1-4050-ab50-1a2e02e977df	The next day, Eliot went with his parents to deliver the money to the charities. The people at the charities were so grateful and thanked Eliot for his kindness.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:57:47.386	2025-11-06 21:57:47.386	#F0FFF0	e69e74db-27b5-415f-a41f-7c880198922c/1d50d71d-c897-428f-b74a-66e926a43ecd.png	4
e2126bce-6750-4680-9d6d-af68f554ad40	Eliot felt so happy that he could help so many people and animals with his winnings. He knew that sharing the money was the right thing to do.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:57:58.186	2025-11-06 21:57:58.186	#F8FFF8	e69e74db-27b5-415f-a41f-7c880198922c/cd5bb503-469d-447c-9506-eb0c3eae02d1.png	5
dbd3b798-ee96-4731-8ef6-265877f36d83	That night, as Eliot was getting ready for bed, he thought about how lucky he was. Not just because he won the jackpot, but because he could use the money to make a difference.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:58:09.646	2025-11-06 21:58:09.646	#F0FFF8	e69e74db-27b5-415f-a41f-7c880198922c/ea6ec742-610b-4f22-890c-64802c6a1ce8.png	6
81f82c61-0743-4074-bd18-c521fb9fe305	Eliot said a prayer, thanking God for the opportunity to help others. He knew that true happiness came from giving, not just getting.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:58:23.246	2025-11-06 21:58:23.246	#F8FFF8	e69e74db-27b5-415f-a41f-7c880198922c/5b1a4e3b-3a93-46d6-8286-76be235cde7e.png	7
b12fe57b-be62-43ba-8010-43b89d50dacb	As Eliot snuggled into his bed, he felt proud of himself for his big decision. He couldn't wait to see how the charities would use the money to make the world a better place.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:58:35.209	2025-11-06 21:58:35.209	#FFF8DC	e69e74db-27b5-415f-a41f-7c880198922c/b8c66eac-8c78-43be-a8f2-4a8520d592ca.png	8
8a4f3d23-96a0-462b-bf6a-1367367cea01	The end. Eliot's generosity and compassion made a big difference in the lives of many. He showed that even a young child can do amazing things when they have a kind heart.	e69e74db-27b5-415f-a41f-7c880198922c	2025-11-06 21:58:50.406	2025-11-06 21:58:50.406	#F5FFFA	e69e74db-27b5-415f-a41f-7c880198922c/c5a39beb-f0ec-4ce8-a958-789b62d123a2.png	9
7d28df07-f983-4743-b4ba-72107907421a	Romain was a 6-year-old boy with brown hair and green eyes. One day, his family told him they were moving to a beautiful island in Thailand! Romain was excited for the big adventure.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:04:10.667	2025-11-06 22:04:10.667	#E0FFFF	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/ea990411-3751-46bd-8b20-da3f785b0aa4.png	0
0bbd64e0-ef86-4a32-b506-a70d0bd6edec	When Romain got to Thailand, everything looked so different! The buildings were colorful, the air was warm, and there were palm trees everywhere. Romain couldn't wait to explore his new home.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:04:23.087	2025-11-06 22:04:23.087	#E0FFFF	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/1d10de86-3e7f-47cd-9674-69dfe540a280.png	1
ceb08514-bbcf-4e0e-b865-f4d3121920da	As Romain walked through the village near his new home, he saw so many amazing things. There were colorful shops selling delicious-smelling food, and people riding bikes and scooters down the streets. Romain made sure to wave and say 'hello' to everyone he passed.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:04:37.129	2025-11-06 22:04:37.129	#F8F8FF	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/8519eebb-7534-41c2-a800-344dd44e6ff0.png	2
6d74adc3-9fb7-465e-81eb-5681814ef995	One day, Romain was playing on the beach near his house when he noticed a girl about his age watching him. She had long, dark hair and brown skin, and she smiled shyly when Romain waved to her. The two children soon became fast friends, playing together every day.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:04:49.746	2025-11-06 22:04:49.746	#FFEFD5	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/b6f9eeb2-c721-40c3-aa55-fb3342b806e1.png	3
0cd7c1f2-5694-4b84-a695-9c8df95bb2cd	As the years went by, Romain and the girl, whose name was Mei, grew up together. They loved exploring the beautiful island, hiking through the jungles, and playing in the sparkling blue ocean. They did everything together and became the best of friends.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:05:03.426	2025-11-06 22:05:03.426	#FFF0F5	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/c3a39394-ffd7-40ac-8d2d-c9c31bb26778.png	4
0d801cb4-7501-4ce9-89e8-50e3876356a0	One day, when Romain and Mei were both 16 years old, Romain realized his feelings for Mei had grown into something more. He nervously asked Mei to be his girlfriend, and to his delight, she said yes! From that day on, they were inseparable.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:05:17.546	2025-11-06 22:05:17.546	#FDF5E6	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/f24a3b70-e4d7-4d45-af9d-1727e52a0ea7.png	5
4ffbdaab-789b-436b-b3e1-3e349c9a7ec7	Years later, when Romain and Mei were both 25 years old, they decided to get married. Their wedding was a beautiful celebration, with all of their loved ones gathered on the beach to witness their special day. Romain and Mei were so happy to start their new life together on the island they had grown to love.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:05:29.507	2025-11-06 22:05:29.507	#F8FFF8	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/9269af94-8ded-4596-9064-f44fc4b8c065.png	6
dab31373-8da4-4856-bab6-5d951cbf605c	After their wedding, Romain and Mei continued to live happily on the island. They built a cozy home and eventually had a beautiful baby girl. The little family spent their days exploring the island, playing in the ocean, and enjoying the peaceful, beautiful environment they called home.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:05:42.526	2025-11-06 22:05:42.526	#E6E6FA	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/b35b493e-4d7d-4e46-bb7d-a7c354e2402f.png	7
7532f57c-cb5c-4285-ae36-1652bfdc2d22	Every evening, Romain, Mei, and their daughter would sit together on the beach and watch the sun dip below the horizon, painting the sky in beautiful shades of orange and pink. They felt so grateful to be living in such a wonderful place, and they knew they would always cherish the adventure that brought Romain to this beautiful island in Thailand.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:05:54.346	2025-11-06 22:05:54.346	#F5F5DC	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/a6ad2940-4da0-4cda-ad93-7a89c021b9fe.png	8
23082bd3-967f-45c1-9631-1ae5e43fd861	As the years passed, Romain and Mei's family continued to grow. They spent their days surrounded by the people and places they loved, watching their daughter and grandchildren explore the same beautiful island they had discovered all those years ago. Romain and Mei knew they had found their true home, and they would always be grateful for the adventure that brought them together.	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4	2025-11-06 22:06:07.166	2025-11-06 22:06:07.166	#FFE4E1	8eab8a65-b3a6-4768-a5b7-45a6404ec0c4/66a81d9f-5c80-4cbb-b917-1107af7b2b6d.png	9
a1e8e2ce-0a5d-48c4-bfef-e508496f9bf2	Lina took a deep breath and stepped into the magical maze. The colorful, twisting paths ahead of her seemed to shimmer and change, as if the maze itself was alive. She gripped her wand tightly and began her search for her missing cat.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:17:57.694	2025-11-06 22:17:57.694	#FAF0E6	c17ccc6b-9159-4418-af07-0274e63ae070/d9f118ce-436f-48fa-909b-5c4bd235a29c.png	0
4a5640f8-796e-4f79-802b-2d6b4b346591	The maze branched into two paths ahead of her. Lina paused, unsure which way to go. She could hear strange sounds coming from both directions - was her cat down one of these paths? Lina decided to follow her instinct and took the path on the left.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:18:12.814	2025-11-06 22:18:12.814	#FFF0F0	c17ccc6b-9159-4418-af07-0274e63ae070/82646f19-90e8-47ab-a100-0644dc558169.png	1
6c3cd8a7-ed50-4d5a-a354-cbc4e4d9b90e	As Lina walked down the left path, the maze opened up into a vast chamber. Strange platforms floated in the air, glowing with magical energy. Lina knew she had to be careful as she jumped from one platform to the next, trying not to lose her balance or fall into the darkness below.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:18:25.434	2025-11-06 22:18:25.434	#F5F5DC	c17ccc6b-9159-4418-af07-0274e63ae070/787b2146-efa0-40aa-85df-b1b6d769496f.png	2
669ef989-3ddb-43fb-9bdf-dee704173fbb	Finally, Lina made it through the tricky platform chamber. She found herself in a serene garden area, with glowing mushrooms and flowers lining the path. A small pond reflected the shimmering colors of the maze walls around her. Lina paused to catch her breath, hoping she was getting closer to finding her cat.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:18:42.657	2025-11-06 22:18:42.657	#F0F8FF	c17ccc6b-9159-4418-af07-0274e63ae070/100db7ce-3ace-4bc1-9e67-ea56677b8077.png	3
f79aa06d-56d6-4c16-9e2a-e70bd4ba0174	Lina continued on, but soon reached a dead end - a tall, thick hedge blocked her path. Just as she was about to turn back, the hedge suddenly parted, revealing a doorway. And there, sitting on the other side, was Lina's cat! She must be getting close to the center of the maze.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:18:54.694	2025-11-06 22:18:54.694	#FFFAF0	c17ccc6b-9159-4418-af07-0274e63ae070/732662d4-2f8a-45de-b76d-1bcc3595f49a.png	4
35bcc139-54ed-4996-9f34-2474d3fe8dc8	Lina hurried through the hedge doorway and found herself in a vast, circular chamber - the center of the maze. There, on a glowing pedestal in the middle of the room, sat Lina's cat. She gripped her wand tightly, ready to use her magic to free her beloved pet.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:19:06.794	2025-11-06 22:19:06.794	#FAF0E6	c17ccc6b-9159-4418-af07-0274e63ae070/ccc5b232-efb7-46ef-a285-5ba273f8fcf8.png	5
97ebae6a-d294-4382-bc15-671c9c2701e0	Lina focused all her magical energy into her wand and unleashed a dazzling spell. The chamber filled with a blinding, swirling light that enveloped the cat on the pedestal. When the light faded, Lina's cat was free! The cat bounded over to Lina, meowing joyfully, and Lina hugged her tightly.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:19:22.854	2025-11-06 22:19:22.854	#FFFFF0	c17ccc6b-9159-4418-af07-0274e63ae070/bacff518-08f6-4486-a9ab-a92c317e0ac4.png	6
bbc4374a-8236-4333-8f69-18c345df7ed9	Relieved to have her cat back, Lina turned her attention to the chamber around her. To her surprise, a glowing doorway had appeared in the wall - it must be the exit from the maze. Lina smiled, ready to leave this magical adventure behind and return home with her beloved pet.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:19:37.416	2025-11-06 22:19:37.416	#FFE4E1	c17ccc6b-9159-4418-af07-0274e63ae070/5d3c78a5-23bd-4494-8c96-09171f87ca4d.png	7
0a9f06ce-107d-4061-b1f0-885c6975f9f6	Lina took a deep breath and stepped through the glowing doorway, her cat safely by her side. As she emerged from the maze, the shifting, colorful walls faded behind her. Lina looked back one last time, amazed by the magical adventure she had just experienced. Then she turned and headed home, her cat purring contentedly.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:19:50.156	2025-11-06 22:19:50.156	#F5F5DC	c17ccc6b-9159-4418-af07-0274e63ae070/f8a8c117-8a2b-48bb-acbd-97d37a8705c1.png	8
0a90b89c-1712-4470-aa6e-c54ac9f3b97e	That night, as Lina snuggled up in bed with her cat, she couldn't stop thinking about her incredible adventure in the magical maze. She was so grateful to have found and rescued her beloved pet. Lina smiled, knowing she would never forget this amazing experience.	c17ccc6b-9159-4418-af07-0274e63ae070	2025-11-06 22:20:03.295	2025-11-06 22:20:03.295	#F5F5DC	c17ccc6b-9159-4418-af07-0274e63ae070/6ba97c8e-48e3-441f-9df8-d699ccc88067.png	9
289f47b1-2beb-4b8d-bae1-92cc00c7b71c	Zara loved reading about brave knights who protected the kingdom. She dreamed of one day becoming a knight herself, and defending her home from any threats.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:26:12.425	2025-11-06 22:26:12.425	#FDF5E6	1040f798-43f9-4f99-8d5f-9c63c2e25c30/f7ff791b-1ed0-440b-9af2-d24b224c82db.png	0
f96a7df8-33ab-4ac4-8713-c91c0c5e5c19	Zara trained hard every day, learning how to wield a sword, ride a horse, and defend herself. The older knights were impressed by her determination and skill.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:26:26.166	2025-11-06 22:26:26.166	#FFF8F0	1040f798-43f9-4f99-8d5f-9c63c2e25c30/9777d6ed-21fa-4756-a51f-547e6dbdef7e.png	1
3ac4e16b-80f2-4ad9-9423-73f9e1e13ec7	Finally, the day came when Zara was awarded the title of knight. She was overjoyed, and set out to patrol the kingdom, ready to protect her home at a moment's notice.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:26:40.708	2025-11-06 22:26:40.708	#E0FFFF	1040f798-43f9-4f99-8d5f-9c63c2e25c30/5311bb6b-ac9d-40b0-8f9d-c15da8be2430.png	2
3b715828-a567-4e4b-b566-25a59d07996b	One day, while on patrol, Zara saw a huge dragon flying towards the castle! She knew she had to act quickly to defend her kingdom.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:26:54.605	2025-11-06 22:26:54.605	#FFF8DC	1040f798-43f9-4f99-8d5f-9c63c2e25c30/2f5adae5-eeda-4842-81cd-3b920a58e335.png	3
0b2164b9-e5f9-4897-80e4-afe1efc371c3	Zara spurred her horse forward, racing to meet the dragon head-on. She knew she had to be brave and use all her knight training to defeat this fearsome creature.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:27:05.965	2025-11-06 22:27:05.965	#FFFFF0	1040f798-43f9-4f99-8d5f-9c63c2e25c30/1ef324a7-3e20-400a-a7cf-0a699a040a4b.png	4
ab248b08-accb-481f-8da9-57e1d782a016	With a mighty battle cry, Zara leapt from her horse and swung her sword at the dragon, aiming to strike it down and save her kingdom.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:27:20.685	2025-11-06 22:27:20.685	#FFF8DC	1040f798-43f9-4f99-8d5f-9c63c2e25c30/6d039c3e-7ff8-481d-be1c-118a494a327c.png	5
7b443cc3-36f2-4f47-8d58-2c24011ce8ae	Zara's sword found its mark, wounding the dragon. But the fight was not over yet - she had to finish the battle and make sure the kingdom was safe.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:27:34.109	2025-11-06 22:27:34.109	#F5FFFA	1040f798-43f9-4f99-8d5f-9c63c2e25c30/fe72754f-28e8-4367-b453-2404843d00d2.png	6
6d4fd3cf-cc1a-4d6a-9f8d-143d5fdba70f	With one final roar, the dragon turned and fled, unable to continue the fight. Zara stood tall, victorious. The kingdom was safe thanks to her bravery!	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:27:48.605	2025-11-06 22:27:48.605	#E0FFFF	1040f798-43f9-4f99-8d5f-9c63c2e25c30/c51abf9f-9936-40b4-a0a8-0882f13bbb32.png	7
cfea4127-ce82-426a-9dc8-a43a2ac65785	The people of the kingdom gathered to honor Zara, their newest and bravest knight. They cheered and thanked her for protecting their home from the fearsome dragon.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:28:01.526	2025-11-06 22:28:01.526	#FFE4E1	1040f798-43f9-4f99-8d5f-9c63c2e25c30/267eefa1-0ef3-4a1a-b184-d2fa3beecfb6.png	8
4f0a9788-ed77-464f-8054-5c4c304e1a9e	Zara was proud to have defended her kingdom. As she rested in the castle gardens, she knew she would always be ready to pick up her sword and shield to protect her home and the people she loved.	1040f798-43f9-4f99-8d5f-9c63c2e25c30	2025-11-06 22:28:16.325	2025-11-06 22:28:16.325	#F5F5DC	1040f798-43f9-4f99-8d5f-9c63c2e25c30/87351cae-182f-49dc-98a3-ffd0335cc0f6.png	9
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, ip, browser, os, "userId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
3ruz7cznytiijg7xgfnryrjyoifnnxvrf5yf3alh	85.3.198.233	Chrome	Mac OS	14a890d6-7f2e-4921-bd89-d6255a633f1c	2026-01-11 19:37:29.686	2025-10-19 19:37:29.687	2025-10-19 19:37:29.687
oz6qa4qbujgrqhtinwm2i6mobgjuufolkfno7khj	195.65.154.203	Firefox	Windows	14a890d6-7f2e-4921-bd89-d6255a633f1c	2026-01-16 09:44:27.131	2025-10-24 09:44:27.132	2025-10-24 09:44:27.132
hmseq3gtd4d5afg32hmjn55r5e6tciynhdkldtpk	213.55.223.172	Mobile Safari	iOS	64488f3a-0beb-40cc-882b-c458d0725a7e	2026-01-17 17:12:27.52	2025-10-25 17:12:27.522	2025-10-25 17:12:27.522
o3jqmnbmowxncbq7yoom7navqe36rnmy4fivlc3x	::1	Chrome	Mac OS	64488f3a-0beb-40cc-882b-c458d0725a7e	2026-01-18 14:29:31.6	2025-10-26 14:29:31.601	2025-10-26 14:29:31.601
phfbytrhx55wzum4bt5m6zmidsbx4ul3mgad3suy	178.38.140.97	Chrome	Mac OS	64488f3a-0beb-40cc-882b-c458d0725a7e	2026-01-18 16:57:16.317	2025-10-26 16:57:16.318	2025-10-26 16:57:16.318
b7ftbd3ptady5fisvxim32w3mijfm4s632zo5vhd	178.38.140.97	Chrome	Windows	64488f3a-0beb-40cc-882b-c458d0725a7e	2026-01-20 20:31:05.272	2025-10-28 20:31:05.273	2025-10-28 20:31:05.273
\.


--
-- Data for Name: Token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Token" (id, token, "userId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, "googleId", "stripeCustomerId", "stripeSubscriptionId", "stripeProductId", "subscriptionStatus", "createdAt", "updatedAt", credits) FROM stdin;
14a890d6-7f2e-4921-bd89-d6255a633f1c	Romain	bruchezromain@gmail.com	$2b$10$VWszuCg3iFzUBxCovSkW/uIN1sGqkGwGrUDmAK1xziamHJgeOgWTm	USER	\N	\N	\N	\N	\N	2025-10-19 19:37:29.67	2025-10-19 19:37:29.67	1
64488f3a-0beb-40cc-882b-c458d0725a7e	Cool Books	rey29raphael@gmail.com	$2b$10$sqvegiwvLblR2vlgn5L7QeyIgDRKbPCY3YowmFFWF1FmciREbKChy	ADMIN	\N	\N	\N	\N	\N	2025-10-22 13:04:38.279	2025-11-06 22:25:32.604	976
\.


--
-- Name: Book Book_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_pkey" PRIMARY KEY (id);


--
-- Name: Page Page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Token Token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: Book Book_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Page Page_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Token Token_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Token"
    ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0YfchcwktLEkc0ujsZEzmCLoJhIkQqsKfwXb3KbAEIVZuwgmkGS5WbQ5flSEoxo

