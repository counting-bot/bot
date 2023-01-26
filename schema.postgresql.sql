/*
 *   Copyright (c) 2023 numselli
 *   All rights reserved.
 *   This repository is licensed under the [Commons Clause License](https://commonsclause.com/). Monetized use of this repository is strictly disallowed.
 */
--
-- PostgreSQL database dump
--

-- Dumped from database version 12.13
-- Dumped by pg_dump version 12.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: countingbot
--

ALTER SCHEMA public OWNER TO countingbot;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: countingbot
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: channellb; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.channellb (
    channelid character varying NOT NULL,
    userid character varying NOT NULL,
    correctcount numeric DEFAULT 0 NOT NULL,
    wrongcount numeric DEFAULT 0 NOT NULL,
    savesused numeric DEFAULT 0 NOT NULL,
    highestcount numeric DEFAULT 0 NOT NULL,
    guildid character varying
);


ALTER TABLE public.channellb OWNER TO countingbot;

--
-- Name: channelsettings; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.channelsettings (
    channelid character varying NOT NULL,
    hs_enabled boolean DEFAULT true NOT NULL,
    wordsenabled boolean DEFAULT true NOT NULL,
    mathenabled boolean DEFAULT true NOT NULL,
    del_message boolean DEFAULT true NOT NULL,
    hook_enabled boolean DEFAULT false NOT NULL,
    hs_react character varying DEFAULT '🏆'::character varying NOT NULL,
    react character varying DEFAULT '✅'::character varying NOT NULL,
    saves_enabled boolean DEFAULT true NOT NULL,
    failban boolean DEFAULT false NOT NULL,
    enablewarning boolean DEFAULT true NOT NULL,
    egg_enabled boolean DEFAULT true NOT NULL,
    nofail boolean DEFAULT false NOT NULL,
    solo boolean DEFAULT false NOT NULL,
    wrongreact character varying DEFAULT '❌'::character varying NOT NULL
);


ALTER TABLE public.channelsettings OWNER TO countingbot;

--
-- Name: countinglog; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.countinglog (
    channelid character varying,
    sender character varying,
    reason character varying,
    number numeric,
    date timestamp without time zone,
    jumpurl character varying
);


ALTER TABLE public.countinglog OWNER TO countingbot;

--
-- Name: data; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.data (
    channelid character varying,
    guildid character varying,
    difficulty integer DEFAULT 0 NOT NULL,
    last_num numeric DEFAULT 0 NOT NULL,
    hs numeric DEFAULT 0 NOT NULL,
    previos_sender character varying DEFAULT ''::character varying NOT NULL,
    hs_user character varying DEFAULT ''::character varying NOT NULL,
    saves numeric DEFAULT 0 NOT NULL,
    max_saves integer DEFAULT 2 NOT NULL,
    savednumbers numeric DEFAULT 0 NOT NULL,
    goal numeric DEFAULT 0 NOT NULL,
    hook_id character varying,
    hook_token character varying,
    name character varying,
    hs_date timestamp without time zone,
    goal_date timestamp without time zone
);


ALTER TABLE public.data OWNER TO countingbot;

--
-- Name: failrole; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.failrole (
    channelid character varying,
    roleid character varying,
    removeon timestamp without time zone DEFAULT (to_timestamp((0)::double precision))::timestamp without time zone NOT NULL
);


ALTER TABLE public.failrole OWNER TO countingbot;

--
-- Name: failtexts; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.failtexts (
    channelid character varying NOT NULL,
    dubbleuser character varying DEFAULT 'You sent two or more numbers in a row, start at ++one++ again'::character varying NOT NULL,
    baknumber character varying DEFAULT 'You cant go back in numbers, silly 🤪, start at ++one++ again'::character varying NOT NULL,
    skippednum character varying DEFAULT 'You skipped a number 😠 start at ++one++ again'::character varying NOT NULL,
    dubblenumber character varying DEFAULT 'The same number was sent twice in a row, start at ++one++ again'::character varying NOT NULL
);


ALTER TABLE public.failtexts OWNER TO countingbot;

--
-- Name: links; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.links (
    name character varying,
    value character varying
);


ALTER TABLE public.links OWNER TO countingbot;

--
-- Name: mothlychannellb; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.mothlychannellb (
    channelid character varying NOT NULL,
    userid character varying NOT NULL,
    correctcount numeric DEFAULT 0 NOT NULL,
    wrongcount numeric DEFAULT 0 NOT NULL,
    savesused numeric DEFAULT 0 NOT NULL,
    highestcount numeric DEFAULT 0 NOT NULL,
    guildid character varying
);


ALTER TABLE public.mothlychannellb OWNER TO countingbot;

--
-- Name: serverdata; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.serverdata (
    serverid character varying NOT NULL,
    name character varying,
    iconurl character varying
);


ALTER TABLE public.serverdata OWNER TO countingbot;

--
-- Name: users; Type: TABLE; Schema: public; Owner: countingbot
--

CREATE TABLE public.users (
    userid character varying NOT NULL,
    isbanned boolean DEFAULT false NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    saves numeric DEFAULT 0 NOT NULL,
    username character varying,
    max_saves numeric DEFAULT 4 NOT NULL
);


ALTER TABLE public.users OWNER TO countingbot;

--
-- Name: channellb channellb_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.channellb
    ADD CONSTRAINT channellb_pkey PRIMARY KEY (userid, channelid);


--
-- Name: channelsettings channelsettings_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.channelsettings
    ADD CONSTRAINT channelsettings_pkey PRIMARY KEY (channelid);

--
-- Name: failtexts failtexts_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.failtexts
    ADD CONSTRAINT failtexts_pkey PRIMARY KEY (channelid);


--
-- Name: mothlychannellb mothlychannellb_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.mothlychannellb
    ADD CONSTRAINT mothlychannellb_pkey PRIMARY KEY (channelid, userid);


--
-- Name: serverdata serverdata_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.serverdata
    ADD CONSTRAINT serverdata_pkey PRIMARY KEY (serverid);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: countingbot
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);

--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: countingbot
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- PostgreSQL database dump complete
--
