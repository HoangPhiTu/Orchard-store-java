--
-- PostgreSQL database dump
--

\restrict aFxLbCtMPNh8AQady2gPLn4I1cH0ePDkjsSUCaxJBCMl2UN2bYtH2yJYr35kBn4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-03 20:08:00

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
-- TOC entry 34 (class 2615 OID 16494)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- TOC entry 23 (class 2615 OID 16388)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- TOC entry 32 (class 2615 OID 16624)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- TOC entry 31 (class 2615 OID 16613)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- TOC entry 12 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- TOC entry 13 (class 2615 OID 16605)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- TOC entry 35 (class 2615 OID 16542)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- TOC entry 37 (class 2615 OID 19526)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- TOC entry 29 (class 2615 OID 16653)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- TOC entry 6 (class 3079 OID 16689)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16443)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 16654)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16432)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1216 (class 1247 OID 16784)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1240 (class 1247 OID 16925)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1213 (class 1247 OID 16778)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1210 (class 1247 OID 16773)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1258 (class 1247 OID 17028)
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1270 (class 1247 OID 17101)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1252 (class 1247 OID 17006)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1261 (class 1247 OID 17038)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1246 (class 1247 OID 16967)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1285 (class 1247 OID 17162)
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- TOC entry 1276 (class 1247 OID 17123)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- TOC entry 1279 (class 1247 OID 17137)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- TOC entry 1291 (class 1247 OID 17204)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- TOC entry 1288 (class 1247 OID 17175)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- TOC entry 1306 (class 1247 OID 17421)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 492 (class 1255 OID 16540)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 511 (class 1255 OID 16755)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- TOC entry 491 (class 1255 OID 16539)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 490 (class 1255 OID 16538)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 490
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 493 (class 1255 OID 16597)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 497 (class 1255 OID 16618)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 494 (class 1255 OID 16599)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 494
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 495 (class 1255 OID 16609)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- TOC entry 496 (class 1255 OID 16610)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- TOC entry 498 (class 1255 OID 16620)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 440 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- TOC entry 553 (class 1255 OID 19647)
-- Name: sync_reserved_quantity_to_warehouse_stock(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_reserved_quantity_to_warehouse_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Trường hợp 1: Tạo mới Reservation
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE warehouse_stock
        SET reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
        WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;
    
    -- Trường hợp 2: Update trạng thái hoặc số lượng
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reservation hết hạn hoặc được giải phóng -> Trừ reserved_quantity
        IF OLD.status = 'ACTIVE' AND NEW.status IN ('EXPIRED', 'RELEASED', 'CONSUMED') THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
            WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;
        
        -- Thay đổi số lượng reservation khi đang ACTIVE (hiếm gặp nhưng cần xử lý)
        ELSIF OLD.status = 'ACTIVE' AND NEW.status = 'ACTIVE' AND OLD.quantity != NEW.quantity THEN
            UPDATE warehouse_stock
            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity + NEW.quantity, 0)
            WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;
        END IF;
    -- Trường hợp 3: Xóa Reservation (DELETE) -> Trừ reserved_quantity
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        UPDATE warehouse_stock
        SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)
        WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_reserved_quantity_to_warehouse_stock() OWNER TO postgres;

--
-- TOC entry 554 (class 1255 OID 19667)
-- Name: update_product_stats_on_review(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_product_stats_on_review() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    affected_product_id BIGINT;
BEGIN
    -- Xác định product_id bị ảnh hưởng
    IF TG_OP = 'DELETE' THEN
        affected_product_id := OLD.product_id;
    ELSE
        affected_product_id := NEW.product_id;
    END IF;

    -- Update stats
    INSERT INTO product_stats (product_id, average_rating, total_reviews, total_verified_reviews)
    SELECT
        affected_product_id,
        COALESCE(AVG(rating)::DECIMAL(3,2), 0),
        COUNT(*),
        COUNT(*) FILTER (WHERE is_verified_purchase = true)
    FROM reviews
    WHERE product_id = affected_product_id AND status = 'APPROVED'
    ON CONFLICT (product_id) DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        total_verified_reviews = EXCLUDED.total_verified_reviews,
        last_calculated_at = CURRENT_TIMESTAMP;

    -- Xử lý trường hợp không còn review nào -> Reset về 0
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = affected_product_id AND status = 'APPROVED') THEN
        UPDATE product_stats
        SET average_rating = 0, total_reviews = 0, total_verified_reviews = 0
        WHERE product_id = affected_product_id;
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;


ALTER FUNCTION public.update_product_stats_on_review() OWNER TO postgres;

--
-- TOC entry 517 (class 1255 OID 17197)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 523 (class 1255 OID 17276)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- TOC entry 519 (class 1255 OID 17209)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- TOC entry 515 (class 1255 OID 17159)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- TOC entry 514 (class 1255 OID 17154)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- TOC entry 518 (class 1255 OID 17205)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- TOC entry 520 (class 1255 OID 17216)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 513 (class 1255 OID 17153)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- TOC entry 522 (class 1255 OID 17275)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- TOC entry 512 (class 1255 OID 17151)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- TOC entry 516 (class 1255 OID 17186)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- TOC entry 521 (class 1255 OID 17269)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 536 (class 1255 OID 17399)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 529 (class 1255 OID 17325)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- TOC entry 548 (class 1255 OID 17439)
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 537 (class 1255 OID 17400)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 540 (class 1255 OID 17403)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 545 (class 1255 OID 17418)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- TOC entry 526 (class 1255 OID 17299)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 525 (class 1255 OID 17298)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 524 (class 1255 OID 17297)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 533 (class 1255 OID 17381)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 534 (class 1255 OID 17397)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 535 (class 1255 OID 17398)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 543 (class 1255 OID 17416)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- TOC entry 531 (class 1255 OID 17364)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 530 (class 1255 OID 17327)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 547 (class 1255 OID 17438)
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 549 (class 1255 OID 17440)
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 539 (class 1255 OID 17402)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 550 (class 1255 OID 17441)
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 552 (class 1255 OID 17446)
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 544 (class 1255 OID 17417)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 532 (class 1255 OID 17380)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- TOC entry 551 (class 1255 OID 17442)
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 538 (class 1255 OID 17401)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 527 (class 1255 OID 17314)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 542 (class 1255 OID 17414)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 541 (class 1255 OID 17413)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 546 (class 1255 OID 17437)
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- TOC entry 528 (class 1255 OID 17315)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 271 (class 1259 OID 16525)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 288 (class 1259 OID 16929)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 288
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 279 (class 1259 OID 16727)
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 279
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 279
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 270 (class 1259 OID 16518)
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 283 (class 1259 OID 16816)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 282 (class 1259 OID 16804)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 281 (class 1259 OID 16791)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 281
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 281
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 291 (class 1259 OID 17041)
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- TOC entry 290 (class 1259 OID 17011)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- TOC entry 292 (class 1259 OID 17074)
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- TOC entry 289 (class 1259 OID 16979)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 269 (class 1259 OID 16507)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 268 (class 1259 OID 16506)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 268
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 286 (class 1259 OID 16858)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 287 (class 1259 OID 16876)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 272 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 280 (class 1259 OID 16757)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 280
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 280
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 280
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 285 (class 1259 OID 16843)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 284 (class 1259 OID 16834)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 284
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 267 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 307 (class 1259 OID 17490)
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    address_line text NOT NULL,
    address_type character varying(50),
    city character varying(100),
    country character varying(100),
    created_at timestamp(6) without time zone NOT NULL,
    customer_id bigint,
    district character varying(100),
    full_name character varying(255) NOT NULL,
    is_default boolean,
    notes text,
    phone character varying(20) NOT NULL,
    postal_code character varying(20),
    updated_at timestamp(6) without time zone,
    user_id bigint,
    ward character varying(100)
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 17489)
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.addresses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 309 (class 1259 OID 17498)
-- Name: attribute_option_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribute_option_translations (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_value character varying(255) NOT NULL,
    locale character varying(10) NOT NULL,
    attribute_option_id bigint NOT NULL
);


ALTER TABLE public.attribute_option_translations OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 17497)
-- Name: attribute_option_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.attribute_option_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.attribute_option_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 311 (class 1259 OID 17504)
-- Name: attribute_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribute_options (
    id bigint NOT NULL,
    color_code character varying(7),
    created_at timestamp(6) without time zone,
    description text,
    display_order integer,
    display_value character varying(255) NOT NULL,
    display_value_en character varying(255),
    hex_color character varying(7),
    image_url character varying(500),
    is_default boolean,
    search_keywords text,
    updated_at timestamp(6) without time zone,
    value character varying(255) NOT NULL,
    attribute_type_id bigint NOT NULL
);


ALTER TABLE public.attribute_options OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 17503)
-- Name: attribute_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.attribute_options ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.attribute_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 313 (class 1259 OID 17512)
-- Name: attribute_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribute_types (
    id bigint NOT NULL,
    attribute_key character varying(100) NOT NULL,
    attribute_name character varying(255) NOT NULL,
    attribute_name_en character varying(255),
    attribute_type character varying(50) NOT NULL,
    color_code character varying(7),
    created_at timestamp(6) without time zone,
    data_type character varying(50) NOT NULL,
    description text,
    display_order integer,
    is_filterable boolean,
    help_text text,
    icon_class character varying(100),
    is_required boolean,
    is_searchable boolean,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    validation_rules text,
    is_variant_specific boolean,
    unit character varying(50),
    CONSTRAINT attribute_types_attribute_type_check CHECK (((attribute_type)::text = ANY ((ARRAY['SELECT'::character varying, 'MULTISELECT'::character varying, 'RANGE'::character varying, 'BOOLEAN'::character varying, 'TEXT'::character varying])::text[]))),
    CONSTRAINT attribute_types_data_type_check CHECK (((data_type)::text = ANY ((ARRAY['STRING'::character varying, 'NUMBER'::character varying, 'DECIMAL'::character varying, 'DATE'::character varying, 'BOOLEAN'::character varying])::text[])))
);


ALTER TABLE public.attribute_types OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 313
-- Name: COLUMN attribute_types.unit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.attribute_types.unit IS 'Đơn vị tính của thuộc tính (ví dụ: ml, g, %, kg, cm). Dùng để hiển thị kèm với giá trị thuộc tính.';


--
-- TOC entry 312 (class 1259 OID 17511)
-- Name: attribute_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.attribute_types ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.attribute_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 315 (class 1259 OID 17522)
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id bigint NOT NULL,
    country character varying(100),
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    display_order integer,
    logo_url character varying(500),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    website_url character varying(500),
    CONSTRAINT brands_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 17521)
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.brands ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 317 (class 1259 OID 17531)
-- Name: bundle_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bundle_items (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer,
    is_required boolean,
    quantity integer NOT NULL,
    bundle_id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_variant_id bigint
);


ALTER TABLE public.bundle_items OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 17530)
-- Name: bundle_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bundle_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.bundle_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 319 (class 1259 OID 17537)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    customer_id bigint,
    expires_at timestamp(6) without time zone,
    quantity integer NOT NULL,
    session_id character varying(255),
    updated_at timestamp(6) without time zone,
    product_variant_id bigint NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 17536)
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.carts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 321 (class 1259 OID 17543)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    display_order integer,
    image_url character varying(500),
    level integer,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    parent_id bigint,
    path character varying(500),
    CONSTRAINT categories_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 17542)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 323 (class 1259 OID 17552)
-- Name: category_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_attributes (
    id bigint NOT NULL,
    display_order integer,
    is_required boolean,
    attribute_id bigint NOT NULL,
    category_id bigint NOT NULL
);


ALTER TABLE public.category_attributes OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 17551)
-- Name: category_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.category_attributes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.category_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 325 (class 1259 OID 17558)
-- Name: concentrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.concentrations (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    display_order integer,
    intensity_level integer,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    acronym character varying(20),
    color_code character varying(7),
    min_oil_percentage integer,
    max_oil_percentage integer,
    longevity character varying(100),
    CONSTRAINT chk_concentrations_max_oil_percentage CHECK (((max_oil_percentage IS NULL) OR ((max_oil_percentage >= 0) AND (max_oil_percentage <= 100)))),
    CONSTRAINT chk_concentrations_min_oil_percentage CHECK (((min_oil_percentage IS NULL) OR ((min_oil_percentage >= 0) AND (min_oil_percentage <= 100)))),
    CONSTRAINT chk_concentrations_oil_percentage_range CHECK (((min_oil_percentage IS NULL) OR (max_oil_percentage IS NULL) OR (min_oil_percentage <= max_oil_percentage))),
    CONSTRAINT concentrations_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);


ALTER TABLE public.concentrations OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN concentrations.acronym; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.concentrations.acronym IS 'Tên viết tắt của nồng độ (ví dụ: EDP, EDT, EDC) - dùng để hiển thị trên Product Card';


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN concentrations.color_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.concentrations.color_code IS 'Mã màu hex đại diện cho nồng độ (ví dụ: #FF5733) - dùng để phân biệt trực quan';


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN concentrations.min_oil_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.concentrations.min_oil_percentage IS 'Tỷ lệ tinh dầu tối thiểu (0-100%) - dùng trong bảng thông số kỹ thuật';


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN concentrations.max_oil_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.concentrations.max_oil_percentage IS 'Tỷ lệ tinh dầu tối đa (0-100%) - dùng trong bảng thông số kỹ thuật';


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN concentrations.longevity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.concentrations.longevity IS 'Độ lưu hương ước tính (ví dụ: "6 - 8 tiếng" hoặc "Trên 12 tiếng") - thông tin khách hàng quan tâm';


--
-- TOC entry 324 (class 1259 OID 17557)
-- Name: concentrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.concentrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.concentrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 327 (class 1259 OID 17567)
-- Name: currency_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency_rates (
    id bigint NOT NULL,
    base_currency character varying(3) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    effective_from timestamp(6) without time zone NOT NULL,
    effective_to timestamp(6) without time zone,
    exchange_rate numeric(10,6) NOT NULL,
    target_currency character varying(3) NOT NULL
);


ALTER TABLE public.currency_rates OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 17566)
-- Name: currency_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.currency_rates ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.currency_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 329 (class 1259 OID 17573)
-- Name: customer_lifetime_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_lifetime_value (
    id bigint NOT NULL,
    calculated_at timestamp(6) without time zone NOT NULL,
    notes text,
    period_type character varying(20),
    total_orders_count integer NOT NULL,
    total_orders_paid_count integer NOT NULL,
    total_purchase_amount numeric(15,2) NOT NULL,
    vip_tier_id bigint,
    vip_tier_name character varying(100),
    customer_id bigint NOT NULL,
    CONSTRAINT customer_lifetime_value_period_type_check CHECK (((period_type)::text = ANY ((ARRAY['SNAPSHOT'::character varying, 'DAILY'::character varying, 'MONTHLY'::character varying, 'YEARLY'::character varying])::text[])))
);


ALTER TABLE public.customer_lifetime_value OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 17572)
-- Name: customer_lifetime_value_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_lifetime_value ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.customer_lifetime_value_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 331 (class 1259 OID 17582)
-- Name: customer_vip_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_vip_history (
    id bigint NOT NULL,
    change_reason text,
    changed_at timestamp(6) without time zone NOT NULL,
    changed_by bigint,
    new_tier_id bigint NOT NULL,
    new_tier_name character varying(100) NOT NULL,
    old_tier_id bigint,
    old_tier_name character varying(100),
    order_id bigint,
    trigger_type character varying(50) NOT NULL,
    trigger_value numeric(15,2),
    customer_id bigint NOT NULL,
    CONSTRAINT customer_vip_history_trigger_type_check CHECK (((trigger_type)::text = ANY ((ARRAY['PURCHASE_AMOUNT'::character varying, 'MANUAL_UPGRADE'::character varying, 'PROMOTION'::character varying, 'ADMIN_ADJUSTMENT'::character varying])::text[])))
);


ALTER TABLE public.customer_vip_history OWNER TO postgres;

--
-- TOC entry 330 (class 1259 OID 17581)
-- Name: customer_vip_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_vip_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.customer_vip_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 333 (class 1259 OID 17591)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    available_points integer,
    created_at timestamp(6) without time zone NOT NULL,
    current_vip_tier_id bigint,
    current_vip_tier_name character varying(100),
    date_of_birth date,
    email character varying(255),
    first_order_date timestamp(6) without time zone,
    full_name character varying(255),
    gender character varying(20),
    last_order_amount numeric(15,2),
    last_order_date timestamp(6) without time zone,
    membership_points integer,
    notes text,
    phone character varying(20) NOT NULL,
    status character varying(20),
    tags jsonb,
    total_orders_count integer,
    total_orders_paid_count integer,
    total_purchase_amount numeric(15,2),
    updated_at timestamp(6) without time zone,
    CONSTRAINT customers_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT customers_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'BLOCKED'::character varying])::text[])))
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 17590)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 427 (class 1259 OID 20841)
-- Name: image_deletion_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image_deletion_queue (
    id bigint NOT NULL,
    image_url character varying(500) NOT NULL,
    entity_type character varying(50),
    entity_id bigint,
    reason character varying(100),
    marked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.image_deletion_queue OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 427
-- Name: TABLE image_deletion_queue; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.image_deletion_queue IS 'Queue để quản lý soft delete của images. Images được mark for deletion thay vì xóa ngay để đảm bảo data consistency.';


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.image_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.image_url IS 'URL đầy đủ của ảnh cần xóa';


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.entity_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.entity_type IS 'Loại entity (users, brands, categories, products, etc.)';


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.entity_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.entity_id IS 'ID của entity (optional)';


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.reason IS 'Lý do xóa: REPLACED, REMOVED, ENTITY_DELETED, ORPHANED';


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.marked_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.marked_at IS 'Thời điểm mark for deletion';


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.deleted_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.deleted_at IS 'Thời điểm xóa vật lý (sau khi cleanup job xóa thành công)';


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 427
-- Name: COLUMN image_deletion_queue.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_deletion_queue.status IS 'Trạng thái: PENDING, PROCESSING, COMPLETED, FAILED';


--
-- TOC entry 426 (class 1259 OID 20840)
-- Name: image_deletion_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.image_deletion_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.image_deletion_queue_id_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 426
-- Name: image_deletion_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.image_deletion_queue_id_seq OWNED BY public.image_deletion_queue.id;


--
-- TOC entry 335 (class 1259 OID 17601)
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by bigint,
    notes text,
    quantity integer NOT NULL,
    reference_id bigint,
    reference_type character varying(50),
    stock_after integer NOT NULL,
    stock_before integer NOT NULL,
    transaction_type character varying(20) NOT NULL,
    product_variant_id bigint NOT NULL,
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying, 'ADJUSTMENT'::character varying, 'RETURN'::character varying, 'DAMAGED'::character varying, 'RESERVE'::character varying, 'RELEASE'::character varying])::text[])))
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 17600)
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_transactions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inventory_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 337 (class 1259 OID 17610)
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    id bigint NOT NULL,
    browser character varying(100),
    device_type character varying(50),
    failure_reason character varying(255),
    ip_address character varying(45),
    location character varying(255),
    login_at timestamp(6) without time zone NOT NULL,
    login_status character varying(20) NOT NULL,
    os character varying(100),
    user_agent character varying(500),
    user_id bigint NOT NULL,
    CONSTRAINT login_history_login_status_check CHECK (((login_status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'LOCKED'::character varying])::text[])))
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- TOC entry 336 (class 1259 OID 17609)
-- Name: login_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.login_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.login_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 339 (class 1259 OID 17619)
-- Name: member_pricing_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_pricing_tiers (
    id bigint NOT NULL,
    benefits_description text,
    benefits_json jsonb,
    card_color_code character varying(7),
    card_image_url character varying(500),
    created_at timestamp(6) without time zone NOT NULL,
    discount_percentage numeric(5,2),
    icon_class character varying(100),
    min_points_required integer,
    min_purchase_amount numeric(15,2),
    status character varying(20),
    tier_display_name character varying(255),
    tier_level integer NOT NULL,
    tier_name character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.member_pricing_tiers OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 17618)
-- Name: member_pricing_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.member_pricing_tiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.member_pricing_tiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 341 (class 1259 OID 17627)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    gift_name character varying(255),
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    sale_price numeric(15,2),
    sku character varying(100),
    subtotal numeric(15,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    variant_name character varying(255),
    gift_product_id bigint,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_variant_id bigint,
    tax_rate numeric(5,2),
    tax_amount numeric(15,2) DEFAULT 0,
    tax_class_id bigint,
    tax_class_name character varying(100),
    CONSTRAINT chk_order_items_tax_amount CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT chk_order_items_tax_rate CHECK (((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric)))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 341
-- Name: COLUMN order_items.tax_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.order_items.tax_rate IS 'Thuế suất tại thời điểm mua (Snapshot)';


--
-- TOC entry 340 (class 1259 OID 17626)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 343 (class 1259 OID 17635)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    counted_at timestamp(6) without time zone,
    counted_towards_lifetime_value boolean,
    created_at timestamp(6) without time zone NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_id bigint,
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    customer_vip_tier_id bigint,
    customer_vip_tier_name character varying(100),
    delivered_at timestamp(6) without time zone,
    discount_amount numeric(15,2),
    email_verified boolean,
    email_verified_at timestamp(6) without time zone,
    notes text,
    order_number character varying(50) NOT NULL,
    paid_at timestamp(6) without time zone,
    payment_method character varying(50),
    payment_status character varying(20),
    payment_transaction_id character varying(255),
    promotion_code character varying(50),
    promotion_id bigint,
    shipped_at timestamp(6) without time zone,
    shipping_address text NOT NULL,
    shipping_city character varying(100),
    shipping_district character varying(100),
    shipping_fee numeric(15,2),
    shipping_method character varying(100),
    shipping_postal_code character varying(20),
    shipping_status character varying(20),
    shipping_ward character varying(100),
    status character varying(20),
    subtotal numeric(15,2) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    tracking_number character varying(255),
    updated_at timestamp(6) without time zone,
    verification_attempts integer,
    verification_blocked_until timestamp(6) without time zone,
    verification_code character varying(10) NOT NULL,
    verification_code_expires_at timestamp(6) without time zone,
    verification_last_sent_at timestamp(6) without time zone,
    verification_sent_count integer,
    verification_sent_limit integer,
    vip_discount_amount numeric(15,2),
    vip_discount_percentage numeric(5,2),
    tax_breakdown jsonb
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN orders.tax_breakdown; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.tax_breakdown IS 'Cấu trúc thuế chi tiết (JSON) tại thời điểm mua';


--
-- TOC entry 342 (class 1259 OID 17634)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 345 (class 1259 OID 17643)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    token character varying(255) NOT NULL,
    used boolean NOT NULL,
    used_at timestamp(6) without time zone,
    user_id bigint NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 17642)
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 347 (class 1259 OID 17649)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    gateway_response jsonb,
    paid_at timestamp(6) without time zone,
    payment_method character varying(50) NOT NULL,
    payment_status character varying(20),
    refund_amount numeric(15,2),
    refund_reason text,
    refunded_at timestamp(6) without time zone,
    transaction_id character varying(255),
    updated_at timestamp(6) without time zone,
    order_id bigint NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 346 (class 1259 OID 17648)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 349 (class 1259 OID 17657)
-- Name: pre_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_orders (
    id bigint NOT NULL,
    converted_order_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    customer_email character varying(255),
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    expected_restock_date date,
    notes text,
    notification_sent boolean,
    notification_sent_at timestamp(6) without time zone,
    quantity integer NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    product_variant_id bigint NOT NULL,
    CONSTRAINT pre_orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'NOTIFIED'::character varying, 'CONVERTED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.pre_orders OWNER TO postgres;

--
-- TOC entry 348 (class 1259 OID 17656)
-- Name: pre_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.pre_orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.pre_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 351 (class 1259 OID 17666)
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    custom_value text,
    display_order integer,
    numeric_value numeric(15,2),
    is_primary boolean,
    scope character varying(20) NOT NULL,
    attribute_type_id bigint NOT NULL,
    attribute_option_id bigint,
    product_id bigint NOT NULL,
    product_variant_id bigint,
    unit character varying(50),
    CONSTRAINT product_attributes_scope_check CHECK (((scope)::text = ANY ((ARRAY['PRODUCT'::character varying, 'VARIANT'::character varying])::text[])))
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 351
-- Name: COLUMN product_attributes.unit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.product_attributes.unit IS 'Đơn vị tính của thuộc tính (ví dụ: ml, g, %, kg, cm). Dùng để hiển thị kèm với giá trị thuộc tính.';


--
-- TOC entry 350 (class 1259 OID 17665)
-- Name: product_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_attributes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 353 (class 1259 OID 17675)
-- Name: product_bundles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_bundles (
    id bigint NOT NULL,
    bundle_price numeric(15,2) NOT NULL,
    bundle_type character varying(50) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    discount_amount numeric(15,2),
    discount_percentage numeric(5,2),
    display_order integer,
    end_date timestamp(6) without time zone,
    image_url character varying(500),
    is_customizable boolean,
    name character varying(255) NOT NULL,
    original_total_price numeric(15,2),
    slug character varying(255) NOT NULL,
    start_date timestamp(6) without time zone,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    CONSTRAINT product_bundles_bundle_type_check CHECK (((bundle_type)::text = ANY ((ARRAY['CURATED_SET'::character varying, 'GIFT_PACKAGE'::character varying, 'COMBO_DEAL'::character varying, 'SEASONAL_SET'::character varying])::text[]))),
    CONSTRAINT product_bundles_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'EXPIRED'::character varying])::text[])))
);


ALTER TABLE public.product_bundles OWNER TO postgres;

--
-- TOC entry 352 (class 1259 OID 17674)
-- Name: product_bundles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_bundles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_bundles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 355 (class 1259 OID 17685)
-- Name: product_comparisons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_comparisons (
    id bigint NOT NULL,
    compared_at timestamp(6) without time zone NOT NULL,
    product_ids bigint[],
    session_id character varying(255),
    user_id bigint
);


ALTER TABLE public.product_comparisons OWNER TO postgres;

--
-- TOC entry 354 (class 1259 OID 17684)
-- Name: product_comparisons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_comparisons ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_comparisons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 357 (class 1259 OID 17693)
-- Name: product_conversion_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_conversion_tracking (
    id bigint NOT NULL,
    add_to_carts integer NOT NULL,
    avg_order_value numeric(15,2),
    avg_view_duration integer NOT NULL,
    cart_to_purchase_rate numeric(5,2),
    created_at timestamp(6) without time zone NOT NULL,
    date date NOT NULL,
    purchases integer NOT NULL,
    revenue numeric(15,2) NOT NULL,
    unique_views integer NOT NULL,
    updated_at timestamp(6) without time zone,
    view_to_cart_rate numeric(5,2),
    view_to_purchase_rate numeric(5,2),
    views integer NOT NULL,
    product_id bigint NOT NULL
);


ALTER TABLE public.product_conversion_tracking OWNER TO postgres;

--
-- TOC entry 356 (class 1259 OID 17692)
-- Name: product_conversion_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_conversion_tracking ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_conversion_tracking_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 359 (class 1259 OID 17699)
-- Name: product_gifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_gifts (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer,
    gift_name character varying(255) NOT NULL,
    gift_value numeric(15,2),
    is_required boolean,
    quantity integer NOT NULL,
    status character varying(20),
    gift_product_id bigint,
    product_id bigint NOT NULL
);


ALTER TABLE public.product_gifts OWNER TO postgres;

--
-- TOC entry 358 (class 1259 OID 17698)
-- Name: product_gifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_gifts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_gifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 361 (class 1259 OID 17705)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    alt_text character varying(255),
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer,
    file_size_bytes bigint,
    height integer,
    image_type character varying(50),
    image_url character varying(500) NOT NULL,
    is_primary boolean,
    thumbnail_url character varying(500),
    width integer,
    product_id bigint NOT NULL,
    product_variant_id bigint
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 17704)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 363 (class 1259 OID 17713)
-- Name: product_member_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_member_prices (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    discount_percentage numeric(5,2),
    member_price numeric(15,2) NOT NULL,
    updated_at timestamp(6) without time zone,
    pricing_tier_id bigint NOT NULL,
    product_variant_id bigint NOT NULL
);


ALTER TABLE public.product_member_prices OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 17712)
-- Name: product_member_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_member_prices ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_member_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 365 (class 1259 OID 17719)
-- Name: product_price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_price_history (
    id bigint NOT NULL,
    change_amount numeric(15,2),
    change_percentage numeric(5,2),
    created_at timestamp(6) without time zone NOT NULL,
    effective_from timestamp(6) without time zone NOT NULL,
    effective_to timestamp(6) without time zone,
    member_price numeric(15,2),
    previous_price numeric(15,2),
    price numeric(15,2) NOT NULL,
    price_change_type character varying(20),
    promotion_id bigint,
    promotion_name character varying(255),
    sale_price numeric(15,2),
    changed_by bigint,
    product_variant_id bigint NOT NULL,
    CONSTRAINT product_price_history_price_change_type_check CHECK (((price_change_type)::text = ANY ((ARRAY['INCREASE'::character varying, 'DECREASE'::character varying, 'PROMOTION'::character varying, 'REGULAR'::character varying])::text[])))
);


ALTER TABLE public.product_price_history OWNER TO postgres;

--
-- TOC entry 364 (class 1259 OID 17718)
-- Name: product_price_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_price_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_price_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 367 (class 1259 OID 17726)
-- Name: product_seo_urls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_seo_urls (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    new_slug character varying(500) NOT NULL,
    old_slug character varying(500) NOT NULL,
    redirect_count integer,
    redirect_type character varying(20),
    product_id bigint NOT NULL
);


ALTER TABLE public.product_seo_urls OWNER TO postgres;

--
-- TOC entry 366 (class 1259 OID 17725)
-- Name: product_seo_urls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_seo_urls ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_seo_urls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 369 (class 1259 OID 17734)
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_specifications (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer NOT NULL,
    specification_key character varying(100) NOT NULL,
    specification_value text NOT NULL,
    product_id bigint NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 17733)
-- Name: product_specifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_specifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_specifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 421 (class 1259 OID 19649)
-- Name: product_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_stats (
    product_id bigint NOT NULL,
    average_rating numeric(3,2) DEFAULT 0,
    total_reviews integer DEFAULT 0,
    total_verified_reviews integer DEFAULT 0,
    total_sold integer DEFAULT 0,
    total_views integer DEFAULT 0,
    last_calculated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_product_stats_counts CHECK (((total_reviews >= 0) AND (total_sold >= 0))),
    CONSTRAINT chk_product_stats_rating CHECK (((average_rating >= (0)::numeric) AND (average_rating <= (5)::numeric)))
);


ALTER TABLE public.product_stats OWNER TO postgres;

--
-- TOC entry 371 (class 1259 OID 17742)
-- Name: product_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_translations (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    full_description text,
    locale character varying(10) NOT NULL,
    meta_description text,
    meta_title character varying(255),
    name character varying(255),
    short_description text,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    created_by bigint,
    product_id bigint,
    product_variant_id bigint
);


ALTER TABLE public.product_translations OWNER TO postgres;

--
-- TOC entry 370 (class 1259 OID 17741)
-- Name: product_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 373 (class 1259 OID 17750)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id bigint NOT NULL,
    allow_backorder boolean,
    allow_out_of_stock_purchase boolean,
    available_from timestamp(6) without time zone,
    available_to timestamp(6) without time zone,
    barcode character varying(100),
    cached_attributes jsonb,
    concentration_code character varying(20),
    cost_price numeric(15,2),
    created_at timestamp(6) without time zone NOT NULL,
    currency_code character varying(3),
    display_order integer,
    full_description text,
    is_default boolean,
    low_stock_threshold integer,
    manage_inventory boolean,
    meta_description text,
    meta_title character varying(255),
    price numeric(15,2) NOT NULL,
    reserved_quantity integer,
    sale_price numeric(15,2),
    short_description text,
    sku character varying(100) NOT NULL,
    slug character varying(255) NOT NULL,
    sold_count integer,
    status character varying(20),
    stock_quantity integer,
    stock_status character varying(20),
    tax_class_id bigint,
    updated_at timestamp(6) without time zone,
    variant_name character varying(255) NOT NULL,
    view_count integer,
    volume_ml integer,
    volume_unit character varying(10),
    weight_grams numeric(8,2),
    weight_unit character varying(10),
    category_id bigint,
    concentration_id bigint,
    created_by bigint,
    product_id bigint NOT NULL,
    updated_by bigint,
    CONSTRAINT product_variants_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'DISCONTINUED'::character varying])::text[]))),
    CONSTRAINT product_variants_stock_status_check CHECK (((stock_status)::text = ANY ((ARRAY['IN_STOCK'::character varying, 'OUT_OF_STOCK'::character varying, 'LOW_STOCK'::character varying, 'BACKORDER'::character varying])::text[])))
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 372 (class 1259 OID 17749)
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 375 (class 1259 OID 17760)
-- Name: product_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_views (
    id bigint NOT NULL,
    added_to_cart boolean,
    added_to_cart_at timestamp(6) without time zone,
    ip_address character varying(45),
    purchased boolean,
    purchased_at timestamp(6) without time zone,
    referrer_url character varying(500),
    session_id character varying(255),
    user_agent text,
    utm_campaign character varying(100),
    utm_medium character varying(100),
    utm_source character varying(100),
    view_duration_seconds integer,
    viewed_at timestamp(6) without time zone NOT NULL,
    order_id bigint,
    product_id bigint NOT NULL,
    user_id bigint
);


ALTER TABLE public.product_views OWNER TO postgres;

--
-- TOC entry 374 (class 1259 OID 17759)
-- Name: product_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_views ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 377 (class 1259 OID 17768)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    archived_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    name character varying(255) NOT NULL,
    published_at timestamp(6) without time zone,
    status character varying(20) NOT NULL,
    updated_at timestamp(6) without time zone,
    brand_id bigint NOT NULL,
    created_by bigint,
    updated_by bigint,
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'UNDER_REVIEW'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 376 (class 1259 OID 17767)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 425 (class 1259 OID 19690)
-- Name: promotion_applicable_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_applicable_categories (
    id bigint NOT NULL,
    promotion_id bigint NOT NULL,
    category_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.promotion_applicable_categories OWNER TO postgres;

--
-- TOC entry 424 (class 1259 OID 19689)
-- Name: promotion_applicable_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_applicable_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_applicable_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 424
-- Name: promotion_applicable_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_applicable_categories_id_seq OWNED BY public.promotion_applicable_categories.id;


--
-- TOC entry 423 (class 1259 OID 19670)
-- Name: promotion_applicable_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_applicable_products (
    id bigint NOT NULL,
    promotion_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.promotion_applicable_products OWNER TO postgres;

--
-- TOC entry 422 (class 1259 OID 19669)
-- Name: promotion_applicable_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_applicable_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_applicable_products_id_seq OWNER TO postgres;

--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 422
-- Name: promotion_applicable_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_applicable_products_id_seq OWNED BY public.promotion_applicable_products.id;


--
-- TOC entry 379 (class 1259 OID 17775)
-- Name: promotion_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_usage (
    id bigint NOT NULL,
    discount_amount numeric(15,2) NOT NULL,
    used_at timestamp(6) without time zone NOT NULL,
    customer_id bigint,
    order_id bigint,
    promotion_id bigint NOT NULL,
    user_id bigint
);


ALTER TABLE public.promotion_usage OWNER TO postgres;

--
-- TOC entry 378 (class 1259 OID 17774)
-- Name: promotion_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.promotion_usage ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.promotion_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 381 (class 1259 OID 17781)
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id bigint NOT NULL,
    applicable_brands jsonb,
    applicable_categories jsonb,
    applicable_products jsonb,
    applicable_to character varying(50),
    code character varying(50) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(15,2),
    end_date timestamp(6) without time zone NOT NULL,
    max_discount_amount numeric(15,2),
    min_purchase_amount numeric(15,2),
    name character varying(255) NOT NULL,
    start_date timestamp(6) without time zone NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone,
    usage_count integer NOT NULL,
    usage_limit integer,
    usage_limit_per_user integer NOT NULL
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- TOC entry 380 (class 1259 OID 17780)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.promotions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.promotions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 417 (class 1259 OID 19574)
-- Name: refund_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund_items (
    id bigint NOT NULL,
    refund_id bigint NOT NULL,
    order_item_id bigint NOT NULL,
    product_variant_id bigint NOT NULL,
    quantity integer NOT NULL,
    refund_amount numeric(15,2) NOT NULL,
    restocked boolean DEFAULT false,
    restocked_at timestamp without time zone,
    restocked_warehouse_id bigint,
    reason character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_refund_items_quantity CHECK ((quantity > 0)),
    CONSTRAINT chk_refund_items_refund_amount CHECK ((refund_amount >= (0)::numeric))
);


ALTER TABLE public.refund_items OWNER TO postgres;

--
-- TOC entry 416 (class 1259 OID 19573)
-- Name: refund_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refund_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refund_items_id_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 416
-- Name: refund_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refund_items_id_seq OWNED BY public.refund_items.id;


--
-- TOC entry 413 (class 1259 OID 19541)
-- Name: refund_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refund_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refund_number_seq OWNER TO postgres;

--
-- TOC entry 415 (class 1259 OID 19543)
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    payment_id bigint,
    refund_number character varying(50) NOT NULL,
    refund_type character varying(20) NOT NULL,
    total_refund_amount numeric(15,2) NOT NULL,
    refund_reason character varying(100),
    refund_notes text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    processed_by bigint,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT refunds_refund_type_check CHECK (((refund_type)::text = ANY ((ARRAY['FULL'::character varying, 'PARTIAL'::character varying, 'ITEM'::character varying])::text[]))),
    CONSTRAINT refunds_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'COMPLETED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.refunds OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 19542)
-- Name: refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refunds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refunds_id_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 414
-- Name: refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refunds_id_seq OWNED BY public.refunds.id;


--
-- TOC entry 383 (class 1259 OID 17789)
-- Name: related_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.related_products (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer,
    relation_type character varying(50),
    product_id bigint NOT NULL,
    related_product_id bigint NOT NULL
);


ALTER TABLE public.related_products OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 17788)
-- Name: related_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.related_products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.related_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 385 (class 1259 OID 17795)
-- Name: review_helpful; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_helpful (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    is_helpful boolean NOT NULL,
    review_id bigint NOT NULL,
    user_id bigint
);


ALTER TABLE public.review_helpful OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 17794)
-- Name: review_helpful_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.review_helpful ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.review_helpful_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 387 (class 1259 OID 17801)
-- Name: review_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_images (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    display_order integer,
    image_url character varying(500) NOT NULL,
    review_id bigint NOT NULL
);


ALTER TABLE public.review_images OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 17800)
-- Name: review_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.review_images ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.review_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 389 (class 1259 OID 17809)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    comment text,
    created_at timestamp(6) without time zone NOT NULL,
    helpful_count integer,
    is_verified_purchase boolean,
    moderated_at timestamp(6) without time zone,
    order_id bigint,
    rating integer NOT NULL,
    report_count integer,
    status character varying(20),
    title character varying(255),
    updated_at timestamp(6) without time zone,
    moderated_by bigint,
    product_id bigint NOT NULL,
    user_id bigint,
    CONSTRAINT reviews_rating_check CHECK (((rating <= 5) AND (rating >= 1))),
    CONSTRAINT reviews_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'HIDDEN'::character varying])::text[])))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 17808)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 391 (class 1259 OID 17819)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    hierarchy_level integer NOT NULL,
    permissions jsonb,
    role_code character varying(50) NOT NULL,
    role_name character varying(100) NOT NULL,
    status character varying(20),
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 17818)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 393 (class 1259 OID 17827)
-- Name: search_queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_queries (
    id bigint NOT NULL,
    clicked_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    filters_applied jsonb,
    ip_address character varying(45),
    query_text character varying(500) NOT NULL,
    results_count integer NOT NULL,
    session_id character varying(255),
    user_agent text,
    clicked_product_id bigint,
    user_id bigint
);


ALTER TABLE public.search_queries OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 17826)
-- Name: search_queries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.search_queries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.search_queries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 395 (class 1259 OID 17835)
-- Name: seo_urls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seo_urls (
    id bigint NOT NULL,
    canonical_url character varying(500),
    created_at timestamp(6) without time zone NOT NULL,
    entity_id bigint,
    entity_type character varying(50),
    new_url character varying(500) NOT NULL,
    notes text,
    old_url character varying(500) NOT NULL,
    redirect_count integer NOT NULL,
    redirect_type character varying(20),
    status character varying(20),
    updated_at timestamp(6) without time zone,
    created_by bigint
);


ALTER TABLE public.seo_urls OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 17834)
-- Name: seo_urls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seo_urls ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.seo_urls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 418 (class 1259 OID 19612)
-- Name: shedlock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shedlock (
    name character varying(64) NOT NULL,
    lock_until timestamp without time zone NOT NULL,
    locked_at timestamp without time zone NOT NULL,
    locked_by character varying(255) NOT NULL
);


ALTER TABLE public.shedlock OWNER TO postgres;

--
-- TOC entry 397 (class 1259 OID 17843)
-- Name: stock_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_alerts (
    id bigint NOT NULL,
    alert_type character varying(20) NOT NULL,
    created_at timestamp(6) without time zone,
    current_quantity integer,
    notes text,
    notified boolean,
    notified_at timestamp(6) without time zone,
    resolved boolean,
    resolved_at timestamp(6) without time zone,
    threshold_quantity integer,
    updated_at timestamp(6) without time zone,
    product_variant_id bigint NOT NULL,
    CONSTRAINT stock_alerts_alert_type_check CHECK (((alert_type)::text = ANY ((ARRAY['LOW_STOCK'::character varying, 'OUT_OF_STOCK'::character varying, 'RESTOCKED'::character varying])::text[])))
);


ALTER TABLE public.stock_alerts OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 17842)
-- Name: stock_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.stock_alerts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.stock_alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 420 (class 1259 OID 19620)
-- Name: stock_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_reservations (
    id bigint NOT NULL,
    product_variant_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    reservation_type character varying(20) NOT NULL,
    reference_id bigint,
    quantity integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_reservations_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT stock_reservations_reservation_type_check CHECK (((reservation_type)::text = ANY ((ARRAY['CART'::character varying, 'CHECKOUT'::character varying, 'ORDER'::character varying])::text[]))),
    CONSTRAINT stock_reservations_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'EXPIRED'::character varying, 'CONSUMED'::character varying, 'RELEASED'::character varying])::text[])))
);


ALTER TABLE public.stock_reservations OWNER TO postgres;

--
-- TOC entry 419 (class 1259 OID 19619)
-- Name: stock_reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_reservations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_reservations_id_seq OWNER TO postgres;

--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 419
-- Name: stock_reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_reservations_id_seq OWNED BY public.stock_reservations.id;


--
-- TOC entry 399 (class 1259 OID 17852)
-- Name: tax_classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_classes (
    id bigint NOT NULL,
    country_code character varying(2),
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    is_default boolean,
    name character varying(100) NOT NULL,
    rate numeric(5,2) NOT NULL,
    status character varying(20)
);


ALTER TABLE public.tax_classes OWNER TO postgres;

--
-- TOC entry 398 (class 1259 OID 17851)
-- Name: tax_classes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tax_classes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tax_classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 401 (class 1259 OID 17860)
-- Name: url_slugs_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.url_slugs_history (
    id bigint NOT NULL,
    changed_at timestamp(6) without time zone NOT NULL,
    entity_id bigint NOT NULL,
    entity_type character varying(50) NOT NULL,
    new_slug character varying(255) NOT NULL,
    old_slug character varying(255) NOT NULL,
    changed_by bigint
);


ALTER TABLE public.url_slugs_history OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 17859)
-- Name: url_slugs_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.url_slugs_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.url_slugs_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 403 (class 1259 OID 17868)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    assigned_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone,
    is_active boolean,
    assigned_by bigint,
    role_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 17867)
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 405 (class 1259 OID 17874)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    additional_permissions jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255) NOT NULL,
    failed_login_attempts integer,
    full_name character varying(255),
    last_login timestamp(6) without time zone,
    last_login_ip character varying(45),
    last_password_reset_request timestamp(6) without time zone,
    locked_until timestamp(6) without time zone,
    notes text,
    password character varying(255) NOT NULL,
    password_changed_at timestamp(6) without time zone,
    phone character varying(20),
    primary_role_id bigint,
    role character varying(20),
    status character varying(20),
    updated_at timestamp(6) without time zone,
    avatar_url character varying(500),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'STAFF'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'BANNED'::character varying, 'SUSPENDED'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 17873)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 407 (class 1259 OID 17884)
-- Name: warehouse_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_stock (
    id bigint NOT NULL,
    quantity integer NOT NULL,
    reserved_quantity integer,
    updated_at timestamp(6) without time zone,
    product_variant_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    CONSTRAINT chk_warehouse_stock_quantity CHECK ((quantity >= 0)),
    CONSTRAINT chk_warehouse_stock_reserved CHECK ((reserved_quantity <= quantity))
);


ALTER TABLE public.warehouse_stock OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 17883)
-- Name: warehouse_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouse_stock ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.warehouse_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 409 (class 1259 OID 17890)
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id bigint NOT NULL,
    address text,
    code character varying(50) NOT NULL,
    contact_phone character varying(20),
    created_at timestamp(6) without time zone NOT NULL,
    is_default boolean,
    name character varying(255) NOT NULL,
    status character varying(20)
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- TOC entry 408 (class 1259 OID 17889)
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 411 (class 1259 OID 17898)
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- TOC entry 410 (class 1259 OID 17897)
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wishlists ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 299 (class 1259 OID 17279)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- TOC entry 293 (class 1259 OID 17117)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 296 (class 1259 OID 17139)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- TOC entry 295 (class 1259 OID 17138)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 273 (class 1259 OID 16546)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 303 (class 1259 OID 17426)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- TOC entry 304 (class 1259 OID 17453)
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- TOC entry 275 (class 1259 OID 16588)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- TOC entry 274 (class 1259 OID 16561)
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 274
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 302 (class 1259 OID 17382)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- TOC entry 300 (class 1259 OID 17329)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- TOC entry 301 (class 1259 OID 17343)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- TOC entry 305 (class 1259 OID 17463)
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- TOC entry 412 (class 1259 OID 19527)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text,
    rollback text[]
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- TOC entry 3906 (class 2604 OID 16510)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 3983 (class 2604 OID 20844)
-- Name: image_deletion_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image_deletion_queue ALTER COLUMN id SET DEFAULT nextval('public.image_deletion_queue_id_seq'::regclass);


--
-- TOC entry 3981 (class 2604 OID 19693)
-- Name: promotion_applicable_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_categories ALTER COLUMN id SET DEFAULT nextval('public.promotion_applicable_categories_id_seq'::regclass);


--
-- TOC entry 3979 (class 2604 OID 19673)
-- Name: promotion_applicable_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_products ALTER COLUMN id SET DEFAULT nextval('public.promotion_applicable_products_id_seq'::regclass);


--
-- TOC entry 3967 (class 2604 OID 19577)
-- Name: refund_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items ALTER COLUMN id SET DEFAULT nextval('public.refund_items_id_seq'::regclass);


--
-- TOC entry 3963 (class 2604 OID 19546)
-- Name: refunds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds ALTER COLUMN id SET DEFAULT nextval('public.refunds_id_seq'::regclass);


--
-- TOC entry 3970 (class 2604 OID 19623)
-- Name: stock_reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_reservations ALTER COLUMN id SET DEFAULT nextval('public.stock_reservations_id_seq'::regclass);


--
-- TOC entry 4732 (class 0 OID 16525)
-- Dependencies: 271
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- TOC entry 4746 (class 0 OID 16929)
-- Dependencies: 288
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- TOC entry 4737 (class 0 OID 16727)
-- Dependencies: 279
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- TOC entry 4731 (class 0 OID 16518)
-- Dependencies: 270
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4741 (class 0 OID 16816)
-- Dependencies: 283
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- TOC entry 4740 (class 0 OID 16804)
-- Dependencies: 282
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- TOC entry 4739 (class 0 OID 16791)
-- Dependencies: 281
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- TOC entry 4749 (class 0 OID 17041)
-- Dependencies: 291
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- TOC entry 4748 (class 0 OID 17011)
-- Dependencies: 290
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- TOC entry 4750 (class 0 OID 17074)
-- Dependencies: 292
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- TOC entry 4747 (class 0 OID 16979)
-- Dependencies: 289
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4730 (class 0 OID 16507)
-- Dependencies: 269
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- TOC entry 4744 (class 0 OID 16858)
-- Dependencies: 286
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- TOC entry 4745 (class 0 OID 16876)
-- Dependencies: 287
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- TOC entry 4733 (class 0 OID 16533)
-- Dependencies: 272
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
\.


--
-- TOC entry 4738 (class 0 OID 16757)
-- Dependencies: 280
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- TOC entry 4743 (class 0 OID 16843)
-- Dependencies: 285
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4742 (class 0 OID 16834)
-- Dependencies: 284
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- TOC entry 4728 (class 0 OID 16495)
-- Dependencies: 267
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- TOC entry 4761 (class 0 OID 17490)
-- Dependencies: 307
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, address_line, address_type, city, country, created_at, customer_id, district, full_name, is_default, notes, phone, postal_code, updated_at, user_id, ward) FROM stdin;
\.


--
-- TOC entry 4763 (class 0 OID 17498)
-- Dependencies: 309
-- Data for Name: attribute_option_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribute_option_translations (id, created_at, display_value, locale, attribute_option_id) FROM stdin;
\.


--
-- TOC entry 4765 (class 0 OID 17504)
-- Dependencies: 311
-- Data for Name: attribute_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribute_options (id, color_code, created_at, description, display_order, display_value, display_value_en, hex_color, image_url, is_default, search_keywords, updated_at, value, attribute_type_id) FROM stdin;
1	\N	2025-12-03 05:36:37.689643	\N	0	50	\N	\N	\N	f	\N	2025-12-03 05:36:37.689643	50	1
2	\N	2025-12-03 05:36:37.840429	\N	1	100	\N	\N	\N	f	\N	2025-12-03 05:36:37.840429	100	1
3	\N	2025-12-03 05:39:41.647221	\N	2	150	\N	\N	\N	f	\N	2025-12-03 05:39:41.647221	150	1
4	\N	2025-12-03 05:41:21.704694	\N	0	Xanh 	\N	\N	\N	f	\N	2025-12-03 05:41:21.704694	xanh	2
5	\N	2025-12-03 05:41:21.839365	\N	1	Đỏ	\N	\N	\N	f	\N	2025-12-03 05:41:21.839365	do	2
\.


--
-- TOC entry 4767 (class 0 OID 17512)
-- Dependencies: 313
-- Data for Name: attribute_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attribute_types (id, attribute_key, attribute_name, attribute_name_en, attribute_type, color_code, created_at, data_type, description, display_order, is_filterable, help_text, icon_class, is_required, is_searchable, status, updated_at, validation_rules, is_variant_specific, unit) FROM stdin;
1	dung-tich	Dung tích	\N	SELECT	\N	2025-12-03 05:36:37.243807	STRING	\N	0	t	\N	\N	f	f	ACTIVE	2025-12-03 05:36:37.243807	\N	f	ml
2	mau-sac	Màu sắc	\N	MULTISELECT	\N	2025-12-03 05:41:21.558297	STRING	\N	0	t	\N	\N	f	f	ACTIVE	2025-12-03 17:10:41.509635	\N	f	\N
\.


--
-- TOC entry 4769 (class 0 OID 17522)
-- Dependencies: 315
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, country, created_at, description, display_order, logo_url, name, slug, status, updated_at, website_url) FROM stdin;
22	\N	2025-12-01 23:02:08.388186	\N	0	\N	test4	test4	ACTIVE	2025-12-01 23:04:57.770399	\N
14	\N	2025-11-25 11:13:30.738316	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/11db2908-59a0-42a6-a277-a75f2cff59e9.webp	Yves Saint Laurent	yves-saint-laurent	INACTIVE	2025-12-02 01:11:17.348855	\N
18	\N	2025-12-01 00:01:15.131014	\N	1	\N	test	test	ACTIVE	2025-12-02 01:12:50.201678	\N
15	\N	2025-11-25 14:59:21.079836	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/6e58ca2c-df95-4fdf-bec8-2b36c703b15b.webp	Dior	dior	ACTIVE	2025-12-02 01:13:24.088949	\N
17	\N	2025-11-30 22:54:39.649831	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/f49fa9d9-6264-4f6b-83c4-05c98efb5c1e.webp	Tom Ford	tom-ford	ACTIVE	2025-12-02 01:13:49.527041	\N
16	\N	2025-11-25 15:00:23.875864	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/e6e1a113-99e3-4341-aa63-f18cf8a470e0.webp	Chanel 	chanel	ACTIVE	2025-12-02 01:14:35.128601	\N
21	\N	2025-12-01 22:54:29.285278	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/1d0071b1-c68c-4942-abab-10605f3402f6.webp	Parfums De Marly	parfums-de-marly	ACTIVE	2025-12-02 01:20:34.671444	\N
30	\N	2025-12-01 23:08:26.693035	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/f371ea28-85d8-4323-84bd-d8cc5dd77b67.webp	Diptyque	diptyque	ACTIVE	2025-12-02 01:22:17.209609	\N
29	\N	2025-12-01 23:08:09.31646	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/2e72c877-2ce2-428e-8eb3-9943b2c72c23.webp	Gucci	gucci	ACTIVE	2025-12-02 01:22:54.005578	\N
28	\N	2025-12-01 23:07:52.011039	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/01d7a98b-2d58-48ea-bec0-1609ec50ea55.webp	Versace	versace	ACTIVE	2025-12-02 01:23:23.178689	\N
27	\N	2025-12-01 23:07:23.360977	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/1f1c60da-bc38-4017-8f5a-58ff984a8e86.webp	Narciso Rodriguez	narciso-rodriguez	ACTIVE	2025-12-02 01:24:02.883315	\N
26	\N	2025-12-01 23:07:04.082893	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/bbf38705-1c6b-476f-adef-428959eeae53.jpg	Maison Margiela	maison-margiela	ACTIVE	2025-12-02 01:25:02.758226	\N
25	\N	2025-12-01 23:06:41.73478	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/275da294-6713-44ff-9e55-ba22a23901d9.webp	Jean Paul Gaultier	jean-paul-gaultier	ACTIVE	2025-12-02 01:25:32.178507	\N
20	\N	2025-12-01 22:41:31.499285	\N	0	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/95fd8af4-cb0b-4930-80d5-577e0c58d5d3.webp	Giorgio Armani	giorgio-armani	ACTIVE	2025-12-02 01:30:23.099814	\N
23	\N	2025-12-01 23:06:09.835351	\N	0	\N	test9	test9	ACTIVE	2025-12-02 13:13:55.098355	\N
24	\N	2025-12-01 23:06:27.623445	\N	0	\N	test10	test10	ACTIVE	2025-12-02 13:14:01.125175	\N
\.


--
-- TOC entry 4771 (class 0 OID 17531)
-- Dependencies: 317
-- Data for Name: bundle_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bundle_items (id, created_at, display_order, is_required, quantity, bundle_id, product_id, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4773 (class 0 OID 17537)
-- Dependencies: 319
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, created_at, customer_id, expires_at, quantity, session_id, updated_at, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4775 (class 0 OID 17543)
-- Dependencies: 321
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, created_at, description, display_order, image_url, level, name, slug, status, updated_at, parent_id, path) FROM stdin;
13	2025-11-26 23:12:57.340398	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/6e1100d4-7c11-4003-a372-cf04d3ddec67.jpg	0	Nước hoa	nuoc-hoa	ACTIVE	2025-11-30 16:49:08.696271	\N	13
3	2025-11-26 14:29:54.934283	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/nuoc-hoa/555dd1f5-1d8b-473a-acfd-31b661f6f7ae.jpg	1	Nước hoa niche	nuoc-hoa-niche	ACTIVE	2025-11-30 16:49:23.677932	13	13/3
7	2025-11-26 22:59:27.606585	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/nuoc-hoa/3bcfae36-86c6-4f1b-87b9-17a01987c277.jpg	1	Nước hoa nữ	nuoc-hoa-nu	ACTIVE	2025-11-30 16:49:44.60643	13	13/7
8	2025-11-26 22:59:54.9238	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/nuoc-hoa/1d9b201b-7dea-445f-b5c4-4050c3d28f39.jpg	1	Nước hoa mini	nuoc-hoa-mini	ACTIVE	2025-11-30 16:50:02.065349	13	13/8
9	2025-11-26 23:00:15.061233	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/nuoc-hoa/f6296ee3-0700-493d-bef9-262a6f7bbcc7.jpg	1	Nước hoa unisex	nuoc-hoa-unisex	ACTIVE	2025-11-30 16:50:30.824369	13	13/9
14	2025-11-26 23:16:28.319163	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/nuoc-hoa/7cbccf3d-b489-4429-a9df-183e1122efc7.jpg	1	Nước hoa nam	nuoc-hoa-nam	ACTIVE	2025-11-30 16:50:59.423642	13	13/14
18	2025-11-30 16:59:20.003926	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/my-pham/8142c93e-14e6-4daa-bf90-0650203381bd.jpg	1	cc	cc	ACTIVE	2025-11-30 18:28:14.636787	10	10/18
16	2025-11-30 16:57:15.136073	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/my-pham/a445d340-bf92-4c54-86e6-165cf2324084.jpg	1	Trang điểm	trang-diem	ACTIVE	2025-11-30 20:54:16.471558	10	10/16
19	2025-12-02 13:08:02.063932	\N	0	\N	0	test	test	ACTIVE	2025-12-02 13:08:02.253413	\N	19
20	2025-12-02 13:08:27.06072	\N	0	\N	1	test1	test1	ACTIVE	2025-12-02 13:08:27.243374	19	19/20
21	2025-12-02 13:09:00.860213	\N	0	\N	1	test2	test2	ACTIVE	2025-12-02 13:09:01.012778	19	19/21
22	2025-12-02 13:09:23.717413	\N	0	\N	1	test3	test3	ACTIVE	2025-12-02 13:09:23.900383	19	19/22
23	2025-12-02 13:10:20.344653	\N	0	\N	1	test4	test4	ACTIVE	2025-12-02 13:10:20.525987	19	19/23
12	2025-11-26 23:03:35.167155	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/48e73a49-abfa-4881-8cd1-b6b2f7f56cf9.jpg	1	Son môi	son-moi	ACTIVE	2025-12-02 14:25:44.716823	10	10/12
10	2025-11-26 23:02:38.369907	\N	0	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/16532fb6-a454-428c-a2aa-50f3511e3c91.jpg	0	Mỹ phẩm	my-pham	ACTIVE	2025-12-02 14:57:57.013411	\N	10
11	2025-11-26 23:03:16.270668	\N	0	\N	1	Sữa rửa mặt	sua-rua-mat	ACTIVE	2025-12-02 14:58:20.638424	10	10/11
\.


--
-- TOC entry 4777 (class 0 OID 17552)
-- Dependencies: 323
-- Data for Name: category_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_attributes (id, display_order, is_required, attribute_id, category_id) FROM stdin;
\.


--
-- TOC entry 4779 (class 0 OID 17558)
-- Dependencies: 325
-- Data for Name: concentrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.concentrations (id, created_at, description, display_order, intensity_level, name, slug, status, updated_at, acronym, color_code, min_oil_percentage, max_oil_percentage, longevity) FROM stdin;
2	2025-12-03 02:17:57.604064	\N	\N	6	Eau de Parfum	eau-de-parfum	ACTIVE	2025-12-03 02:18:15.050563	EDP	\N	\N	\N	6 - 8 tiếng
3	2025-12-03 02:20:15.258813	\N	\N	3	 Eau de Toilette	eau-de-toilette	INACTIVE	2025-12-03 02:20:15.258813	EDT	\N	\N	\N	\N
\.


--
-- TOC entry 4781 (class 0 OID 17567)
-- Dependencies: 327
-- Data for Name: currency_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency_rates (id, base_currency, created_at, effective_from, effective_to, exchange_rate, target_currency) FROM stdin;
\.


--
-- TOC entry 4783 (class 0 OID 17573)
-- Dependencies: 329
-- Data for Name: customer_lifetime_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_lifetime_value (id, calculated_at, notes, period_type, total_orders_count, total_orders_paid_count, total_purchase_amount, vip_tier_id, vip_tier_name, customer_id) FROM stdin;
\.


--
-- TOC entry 4785 (class 0 OID 17582)
-- Dependencies: 331
-- Data for Name: customer_vip_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_vip_history (id, change_reason, changed_at, changed_by, new_tier_id, new_tier_name, old_tier_id, old_tier_name, order_id, trigger_type, trigger_value, customer_id) FROM stdin;
\.


--
-- TOC entry 4787 (class 0 OID 17591)
-- Dependencies: 333
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, available_points, created_at, current_vip_tier_id, current_vip_tier_name, date_of_birth, email, first_order_date, full_name, gender, last_order_amount, last_order_date, membership_points, notes, phone, status, tags, total_orders_count, total_orders_paid_count, total_purchase_amount, updated_at) FROM stdin;
\.


--
-- TOC entry 4881 (class 0 OID 20841)
-- Dependencies: 427
-- Data for Name: image_deletion_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.image_deletion_queue (id, image_url, entity_type, entity_id, reason, marked_at, deleted_at, status, updated_at) FROM stdin;
14	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/499363b1-b14f-4020-91f8-a729b876e35b.jpg	brands	18	REPLACED	2025-12-01 11:51:26.4485	2025-12-03 02:00:01.874367	COMPLETED	2025-12-03 02:00:02.33032
15	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/15f5b915-7062-4be8-aa51-6d01797c5a0b.jpg	brands	14	REMOVED	2025-12-01 11:52:10.577888	2025-12-03 02:00:01.881014	COMPLETED	2025-12-03 02:00:02.515577
16	http://127.0.0.1:9000/orchard-bucket/users/2025/11/30/8e16dc94-241a-463b-86ac-036355644d16.jpg	users	8	REPLACED	2025-12-01 11:54:17.654217	2025-12-03 02:00:01.888166	COMPLETED	2025-12-03 02:00:02.645217
17	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/c8064746-9454-4e57-9550-2d850e3f2337.jpg	brands	18	REPLACED	2025-12-01 12:04:41.46754	2025-12-03 02:00:01.896063	COMPLETED	2025-12-03 02:00:02.77363
18	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/0dc25173-e913-474d-9ef3-b19ebf669d85.jpg	brands	14	REMOVED	2025-12-01 12:20:04.175083	2025-12-03 02:00:01.903393	COMPLETED	2025-12-03 02:00:02.901975
19	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/5abd7070-209a-4dfe-9b6c-c312e2b7062f.jpg	brands	18	REMOVED	2025-12-01 12:36:10.158234	2025-12-03 02:00:01.913474	COMPLETED	2025-12-03 02:00:03.032265
20	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/14cf4479-30d0-44b2-aab2-32e27708cd8d.jpg	brands	18	REMOVED	2025-12-01 12:48:36.175857	2025-12-03 02:00:01.923121	COMPLETED	2025-12-03 02:00:03.161765
21	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/60f48a2d-e9ed-4429-986d-97f67b5844a8.jpg	brands	14	REPLACED	2025-12-01 13:04:36.750618	2025-12-03 02:00:01.933049	COMPLETED	2025-12-03 02:00:03.292039
22	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/72539135-5bd6-478d-9960-1c3aad544955.jpg	brands	18	REPLACED	2025-12-01 13:19:03.774708	2025-12-03 02:00:01.940303	COMPLETED	2025-12-03 02:00:03.419603
23	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/cd3e5dc0-a67d-4438-9ad6-9f56f075f611.jpg	brands	18	REPLACED	2025-12-01 13:28:14.790562	2025-12-03 02:00:01.948588	COMPLETED	2025-12-03 02:00:03.549559
24	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/15cb1d93-06a2-4cf9-93a2-27dde578b285.jpg	brands	14	REPLACED	2025-12-01 13:28:33.616241	2025-12-03 02:00:01.958478	COMPLETED	2025-12-03 02:00:03.680367
25	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/aead962a-952e-4e27-8750-86210682c495.jpg	brands	18	REPLACED	2025-12-01 13:28:48.846956	2025-12-03 02:00:01.968445	COMPLETED	2025-12-03 02:00:03.811694
1	http://127.0.0.1:9000/orchard-bucket/users/0f8dfd9c-16f2-404d-9137-09449555f1c9.jpg	users	10	REPLACED	2025-11-30 22:26:41.031252	2025-12-02 02:00:02.638611	COMPLETED	2025-12-02 02:00:02.927903
2	http://127.0.0.1:9000/orchard-bucket/users/6ec2268c-3af8-48d2-af1f-f7ab13778f43.jpg	users	5	REPLACED	2025-11-30 22:28:12.000266	2025-12-02 02:00:02.654887	COMPLETED	2025-12-02 02:00:03.11375
3	http://127.0.0.1:9000/orchard-bucket/users/3da9f282-8b43-489f-8f8d-728ff994adc7.jpg	users	4	REPLACED	2025-11-30 22:28:36.944275	2025-12-02 02:00:02.677675	COMPLETED	2025-12-02 02:00:03.272147
4	http://127.0.0.1:9000/orchard-bucket/brands/e2068fbc-8e49-4bf4-b64a-4cbebf13a11b.webp	brands	15	REMOVED	2025-11-30 22:49:17.771584	2025-12-02 02:00:02.685435	COMPLETED	2025-12-02 02:00:03.423452
5	http://127.0.0.1:9000/orchard-bucket/brands/c3d1bff4-7f8b-4725-a86f-54157a098109.webp	brands	14	REPLACED	2025-11-30 22:53:45.917466	2025-12-02 02:00:02.701102	COMPLETED	2025-12-02 02:00:03.576426
6	http://127.0.0.1:9000/orchard-bucket/brands/0e40147f-40e9-4d20-ba9c-f3868c1b26f7.jpg	brands	16	REMOVED	2025-11-30 23:04:34.984511	2025-12-02 02:00:02.713836	COMPLETED	2025-12-02 02:00:03.729674
7	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/d63e6780-395d-4309-9a0e-6c600524bbde.webp	brands	15	REPLACED	2025-11-30 23:18:24.493837	2025-12-02 02:00:02.833639	COMPLETED	2025-12-02 02:00:03.881659
8	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/98cace06-be73-4103-8122-a0a55c55e70e.jpg	brands	15	REPLACED	2025-11-30 23:33:47.291067	2025-12-02 02:00:02.854936	COMPLETED	2025-12-02 02:00:04.0293
9	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/4ba7f1b4-2977-4491-b53e-501517e4f8f4.jpg	brands	15	REPLACED	2025-11-30 23:43:56.7314	2025-12-02 02:00:02.860095	COMPLETED	2025-12-02 02:00:04.182825
10	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/5b5b29ca-6121-43c0-894a-7e8c2e3c2880.webp	brands	14	REPLACED	2025-12-01 00:03:47.167454	2025-12-02 02:00:02.865669	COMPLETED	2025-12-02 02:00:04.332082
11	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/ee6a4027-000d-47d1-bd76-e8e8a85fdbde.jpg	brands	18	REMOVED	2025-12-01 00:12:37.290311	2025-12-02 02:00:02.892148	COMPLETED	2025-12-02 02:00:04.485724
12	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/a964df68-30cc-4ec4-bbad-a4c7c5364bcb.jpg	brands	18	REMOVED	2025-12-01 00:36:53.18243	2025-12-02 02:00:02.897859	COMPLETED	2025-12-02 02:00:04.637834
13	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/38b6992c-4749-4903-a904-f90231b8a21e.jpg	brands	14	REMOVED	2025-12-01 00:40:43.02512	2025-12-02 02:00:02.902472	COMPLETED	2025-12-02 02:00:04.786116
54	http://127.0.0.1:9000/orchard-bucket/categories/14c3966d-88e1-4a85-b1c8-b89984b60019.jpg	categories	10	REPLACED	2025-12-02 10:15:20.223803	\N	PENDING	2025-12-02 10:15:20.223803
55	http://127.0.0.1:9000/orchard-bucket/categories/my-pham/7647d3d1-14f6-4ebc-b9fc-628e3585a38d.jpg	categories	11	REPLACED	2025-12-02 10:25:12.271798	\N	PENDING	2025-12-02 10:25:12.271798
56	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/f4219139-4aa1-4757-8a59-b8e2ee48b457.jpg	categories	10	REPLACED	2025-12-02 10:50:47.63861	\N	PENDING	2025-12-02 10:50:47.63861
57	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/b9aa9197-5f0b-4bb6-9929-fd4f30ab77b1.jpg	categories	11	REPLACED	2025-12-02 10:51:08.924552	\N	PENDING	2025-12-02 10:51:08.924552
58	http://127.0.0.1:9000/orchard-bucket/categories/my-pham/86dbc2c2-16e8-4bed-973d-fe153ff7ffc6.jpg	categories	12	REPLACED	2025-12-02 10:51:30.537984	\N	PENDING	2025-12-02 10:51:30.537984
59	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/50ff4e42-c0ca-4485-bb0f-2bc53933618f.jpg	categories	10	REPLACED	2025-12-02 11:09:19.042312	\N	PENDING	2025-12-02 11:09:19.042312
60	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/8a73eb4b-34c6-447a-8153-677a0a6d8614.jpg	categories	11	REPLACED	2025-12-02 11:09:43.542532	\N	PENDING	2025-12-02 11:09:43.542532
61	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/4c4f5f6b-0ae3-4283-a5b6-fad664af26ad.jpg	categories	12	REPLACED	2025-12-02 11:10:42.735466	\N	PENDING	2025-12-02 11:10:42.735466
62	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/f19000d9-c858-40cf-b6cb-82440b4ada07.jpg	categories	10	REPLACED	2025-12-02 12:19:25.617192	\N	PENDING	2025-12-02 12:19:25.617192
63	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/7c37faf9-7ca9-44fb-ae61-c76b546f8f20.jpg	categories	10	REPLACED	2025-12-02 12:51:29.410577	\N	PENDING	2025-12-02 12:51:29.410577
64	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/e22dae2a-8a38-4ead-b046-b3900a35dfcf.jpg	categories	10	REPLACED	2025-12-02 13:03:25.37613	\N	PENDING	2025-12-02 13:03:25.37613
65	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/e6b511e8-c8f7-4e4c-8f3d-d20ecb13d77f.jpg	categories	11	REPLACED	2025-12-02 13:03:47.100865	\N	PENDING	2025-12-02 13:03:47.100865
66	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/d8dca9b6-7ec6-4a12-a76e-fcdd824e9223.jpg	categories	12	REPLACED	2025-12-02 13:04:04.591484	\N	PENDING	2025-12-02 13:04:04.591484
67	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/6ed69fe9-275f-415d-8125-e2b05b31c680.jpg	categories	11	REPLACED	2025-12-02 13:06:59.35405	\N	PENDING	2025-12-02 13:06:59.35405
68	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/6c0fd1c7-cb8e-43fc-98bb-c84cc0a58f60.jpg	brands	23	REMOVED	2025-12-02 13:13:55.595284	\N	PENDING	2025-12-02 13:13:55.595284
69	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/af991419-2b96-40de-accc-c5266ce8dd34.jpg	brands	24	REMOVED	2025-12-02 13:14:01.571432	\N	PENDING	2025-12-02 13:14:01.571432
70	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/37213b06-9482-417a-9e19-31a5a026bb92.jpg	categories	10	REPLACED	2025-12-02 13:15:26.958964	\N	PENDING	2025-12-02 13:15:26.958964
71	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/78b04f0d-5ef5-4dad-ac8e-e8cae5a0633f.jpg	categories	11	REPLACED	2025-12-02 13:15:41.299974	\N	PENDING	2025-12-02 13:15:41.299974
72	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/7b1c6cd1-fc9f-415f-9c5a-70097a8c0f26.jpg	categories	12	REPLACED	2025-12-02 13:15:55.934346	\N	PENDING	2025-12-02 13:15:55.934346
73	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/27cc6135-1a50-40ee-9824-3c17f006bd93.jpg	categories	10	REPLACED	2025-12-02 13:25:50.405197	\N	PENDING	2025-12-02 13:25:50.406305
74	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/d18d55d9-33d7-4b99-bb89-ce1c636da755.jpg	categories	10	REPLACED	2025-12-02 13:26:35.068557	\N	PENDING	2025-12-02 13:26:35.068557
75	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/8b645a37-3aa4-442a-8a99-d57b289c3daf.jpg	categories	11	REPLACED	2025-12-02 13:26:52.070001	\N	PENDING	2025-12-02 13:26:52.070001
76	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/efc311a7-83b0-4f86-9bdb-e55383dc8d09.jpg	categories	10	REPLACED	2025-12-02 13:28:12.345171	\N	PENDING	2025-12-02 13:28:12.345171
77	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/1161d7fd-64bb-40ce-a2ba-6f0226832099.jpg	categories	10	REPLACED	2025-12-02 13:28:55.552937	\N	PENDING	2025-12-02 13:28:55.552937
78	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/031b42c7-1602-49a7-8fde-0cfa59b763ba.jpg	categories	10	REPLACED	2025-12-02 13:34:20.215864	\N	PENDING	2025-12-02 13:34:20.215864
79	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/e1edd8d9-fc6a-4954-bd32-032befde05bf.jpg	categories	11	REPLACED	2025-12-02 13:34:35.499759	\N	PENDING	2025-12-02 13:34:35.499759
80	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/6c2ed5df-0298-4224-98cf-dc8a2357f850.jpg	categories	10	REPLACED	2025-12-02 13:47:14.485854	\N	PENDING	2025-12-02 13:47:14.485854
81	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/03d208cb-4386-48ee-b360-872eee266422.jpg	categories	10	REPLACED	2025-12-02 13:47:34.675564	\N	PENDING	2025-12-02 13:47:34.675564
82	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/277bc02d-5cbd-4873-9e93-dda2937f4e15.jpg	categories	11	REPLACED	2025-12-02 13:48:14.712851	\N	PENDING	2025-12-02 13:48:14.712851
83	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/37e43128-f576-44ca-b291-eadd00559d8e.jpg	categories	12	REPLACED	2025-12-02 13:48:29.864803	\N	PENDING	2025-12-02 13:48:29.864803
84	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/000d59de-46e4-46e0-812b-77550685fd7d.jpg	categories	11	REPLACED	2025-12-02 13:48:44.194265	\N	PENDING	2025-12-02 13:48:44.194265
85	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/60246163-e1a9-4ae3-afa5-4e8f66c52882.jpg	categories	12	REMOVED	2025-12-02 13:49:01.04272	\N	PENDING	2025-12-02 13:49:01.04272
86	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/144fff44-0229-459a-86ad-d3bea4237dbe.jpg	categories	10	REMOVED	2025-12-02 13:49:18.503435	\N	PENDING	2025-12-02 13:49:18.503435
87	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/89392cc8-cad2-4bdf-832b-68f16472d373.jpg	categories	10	REPLACED	2025-12-02 13:58:27.792643	\N	PENDING	2025-12-02 13:58:27.792643
88	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/4acd3be7-6581-4d57-abe7-7805e5b6dcc8.jpg	categories	11	REMOVED	2025-12-02 14:26:41.341029	\N	PENDING	2025-12-02 14:26:41.341029
89	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/557fab4b-b5a5-4934-9851-ef57a0ce7c8b.jpg	categories	10	REMOVED	2025-12-02 14:27:21.434183	\N	PENDING	2025-12-02 14:27:21.434183
90	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/80b6484c-268d-4d68-9341-0e893fff68dc.jpg	categories	10	REPLACED	2025-12-02 14:38:32.482327	\N	PENDING	2025-12-02 14:38:32.482327
91	http://127.0.0.1:9000/orchard-bucket/categories/2025/12/02/7e2c8f1e-4a36-483b-84a4-dfb1616bd8e1.jpg	categories	11	REPLACED	2025-12-02 14:58:22.140237	\N	PENDING	2025-12-02 14:58:22.140237
26	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/93cec512-b893-4ab6-b633-7e6b3a01438e.jpg	brands	14	REPLACED	2025-12-01 13:29:26.070357	2025-12-03 02:00:01.974995	COMPLETED	2025-12-03 02:00:03.940832
27	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/ec4ddc5e-57fc-4a01-9da9-926f0f7c1ca4.jpg	brands	14	REMOVED	2025-12-01 13:36:36.114508	2025-12-03 02:00:01.984686	COMPLETED	2025-12-03 02:00:04.073599
28	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/14bb949e-dacf-49b0-ac56-ce162d4da287.jpg	brands	14	REPLACED	2025-12-01 13:43:10.838901	2025-12-03 02:00:01.990514	COMPLETED	2025-12-03 02:00:04.203921
29	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/e88c1a8e-33e4-47d1-9421-628e54b53f0d.jpg	brands	14	REMOVED	2025-12-01 13:46:23.755918	2025-12-03 02:00:02.000556	COMPLETED	2025-12-03 02:00:04.335062
30	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/8956e971-20b6-40ef-808a-2872cf7e7a58.jpg	brands	18	REPLACED	2025-12-01 14:12:15.917214	2025-12-03 02:00:02.008576	COMPLETED	2025-12-03 02:00:04.464136
31	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/970506ef-6d74-4f6e-9a5f-052cba70ee91.jpg	brands	14	REPLACED	2025-12-01 14:12:26.934635	2025-12-03 02:00:02.018218	COMPLETED	2025-12-03 02:00:04.590388
32	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/2c81e501-f871-40a9-aceb-33bc7548645f.jpg	brands	18	REPLACED	2025-12-01 14:21:29.678713	2025-12-03 02:00:02.026499	COMPLETED	2025-12-03 02:00:04.72385
33	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/aaeaaadd-2a27-4183-93bc-5f6371d4a175.jpg	brands	18	REMOVED	2025-12-01 14:22:28.020937	2025-12-03 02:00:02.036228	COMPLETED	2025-12-03 02:00:04.852888
34	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/0bd3da62-d6be-4cbf-8ccb-c1519fdcbe39.jpg	brands	14	REMOVED	2025-12-01 15:15:31.630563	2025-12-03 02:00:02.042569	COMPLETED	2025-12-03 02:00:04.983323
35	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/1f24e3ca-7865-410a-a1f5-0cadeab905ec.jpg	brands	18	REMOVED	2025-12-01 22:29:13.919331	2025-12-03 02:00:02.050657	COMPLETED	2025-12-03 02:00:05.113722
36	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/95c07150-265f-4c9b-92fc-6363c7bcb9ae.jpg	brands	14	REPLACED	2025-12-01 22:40:56.427158	2025-12-03 02:00:02.057475	COMPLETED	2025-12-03 02:00:05.244559
37	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/272fc113-dd4e-479b-a5df-d548aee0b4a1.jpg	brands	19	REMOVED	2025-12-01 22:41:07.507084	2025-12-03 02:00:02.06612	COMPLETED	2025-12-03 02:00:05.37646
38	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/4d4e4d55-ff45-447c-97af-124e72703543.jpg	brands	20	REMOVED	2025-12-01 23:02:57.070458	2025-12-03 02:00:02.074295	COMPLETED	2025-12-03 02:00:05.507364
39	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/acdcb7e7-80f4-491f-9ad7-f910659fb607.jpg	brands	21	REMOVED	2025-12-01 23:03:14.223098	2025-12-03 02:00:02.083661	COMPLETED	2025-12-03 02:00:05.636739
40	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/ab070290-87ed-47cf-93e6-bafefca33885.jpg	brands	22	REMOVED	2025-12-01 23:03:26.234351	2025-12-03 02:00:02.094165	COMPLETED	2025-12-03 02:00:05.766501
41	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/6ea3be9d-dcb6-4420-8986-bbc9404c4414.jpg	brands	20	REPLACED	2025-12-01 23:04:50.541541	2025-12-03 02:00:02.101475	COMPLETED	2025-12-03 02:00:05.898061
42	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/6115f715-def9-4db5-a8e5-da111b7e1d6f.jpg	brands	22	REPLACED	2025-12-01 23:05:04.197944	2025-12-03 02:00:02.1113	COMPLETED	2025-12-03 02:00:06.029792
43	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/999c3bd4-f73e-4cef-8e04-b98dd89c7c22.jpg	brands	21	REPLACED	2025-12-01 23:05:34.763937	2025-12-03 02:00:02.120637	COMPLETED	2025-12-03 02:00:06.16066
44	http://127.0.0.1:9000/orchard-bucket/users/2025/11/30/9af57a0b-386e-4c1c-8400-dd3c429c3e5b.jpg	users	5	REPLACED	2025-12-02 00:44:45.723708	2025-12-03 02:00:02.131335	COMPLETED	2025-12-03 02:00:06.292122
45	http://127.0.0.1:9000/orchard-bucket/users/2025/11/30/7c6e253b-e224-4644-8c55-65c3237eb438.jpg	users	6	REPLACED	2025-12-02 00:45:24.216198	2025-12-03 02:00:02.140144	COMPLETED	2025-12-03 02:00:06.423661
46	http://127.0.0.1:9000/orchard-bucket/users/2025/11/30/ec81e9e0-ec5e-40df-b17f-964b7556b9c5.jpg	users	10	REPLACED	2025-12-02 00:54:56.492669	2025-12-03 02:00:02.148601	COMPLETED	2025-12-03 02:00:06.565085
47	http://127.0.0.1:9000/orchard-bucket/users/2025/11/30/fc877051-771c-47ee-9d86-b6c5ef01a359.jpg	users	4	REPLACED	2025-12-02 00:55:19.135966	2025-12-03 02:00:02.156822	COMPLETED	2025-12-03 02:00:06.700467
48	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/0ea9a3fc-3c6e-42de-8dbf-874edf4ca8a7.webp	brands	15	REPLACED	2025-12-02 01:11:53.92618	2025-12-03 02:00:02.164436	COMPLETED	2025-12-03 02:00:06.829476
49	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/53a004cf-f51a-4227-8d65-b5a56ce41c6d.webp	brands	17	REPLACED	2025-12-02 01:12:05.751513	2025-12-03 02:00:02.170622	COMPLETED	2025-12-03 02:00:06.960505
50	http://127.0.0.1:9000/orchard-bucket/brands/2025/11/30/ed22f165-e1fd-428a-8d50-c8af4c085ddf.webp	brands	16	REMOVED	2025-12-02 01:12:14.419991	2025-12-03 02:00:02.179702	COMPLETED	2025-12-03 02:00:07.091246
51	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/01/21553500-6bd9-4d7a-a205-ea140065626d.jpg	brands	18	REMOVED	2025-12-02 01:12:51.968848	2025-12-03 02:00:02.193887	COMPLETED	2025-12-03 02:00:07.221138
52	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/77fe2e32-807c-4837-996a-4d268d581fb6.webp	brands	20	REPLACED	2025-12-02 01:30:24.028331	2025-12-03 02:00:02.201712	COMPLETED	2025-12-03 02:00:07.357436
53	http://127.0.0.1:9000/orchard-bucket/brands/2025/12/02/fb598a39-e6e6-4acb-a1ab-f4b320cab979.jpg	brands	\N	ORPHANED	2025-12-02 01:30:47.250272	2025-12-03 02:00:02.242377	COMPLETED	2025-12-03 02:00:07.48615
\.


--
-- TOC entry 4789 (class 0 OID 17601)
-- Dependencies: 335
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, created_at, created_by, notes, quantity, reference_id, reference_type, stock_after, stock_before, transaction_type, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4791 (class 0 OID 17610)
-- Dependencies: 337
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_history (id, browser, device_type, failure_reason, ip_address, location, login_at, login_status, os, user_agent, user_id) FROM stdin;
1	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:04:07.814421	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
2	Chrome	DESKTOP	Sai mật khẩu	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:29:50.815503	FAILED	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
3	Chrome	DESKTOP	Sai mật khẩu	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:29:59.022078	FAILED	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	5
4	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:30:08.227588	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
5	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:31:22.750611	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	5
6	Safari	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-24 18:32:03.005996	SUCCESS	iOS	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	4
7	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 08:29:38.029321	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
8	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 09:09:53.027281	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
9	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 11:12:56.5933	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
10	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 14:06:33.219035	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
11	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 17:08:49.789931	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
12	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 17:09:37.112421	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
13	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-25 20:18:35.922508	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
14	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-26 10:44:31.054694	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
15	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-26 13:35:51.519697	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
16	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-26 14:47:43.139108	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
17	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-26 16:14:15.964634	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
18	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-26 16:14:40.7485	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
19	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-29 11:51:20.552494	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
20	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-29 23:55:19.094566	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
21	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 00:01:54.757092	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
22	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 00:17:16.867791	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
23	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 01:05:48.937192	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
24	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 01:27:24.072048	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
25	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 02:53:00.583235	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
26	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 02:54:33.217023	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
27	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 09:36:12.158241	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
28	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 09:48:47.838592	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
29	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 09:51:54.325544	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
30	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 09:56:51.904989	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
31	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 10:07:14.035109	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
32	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 12:17:27.087763	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
33	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 12:17:41.902065	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
34	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 12:36:28.632628	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
35	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 14:21:15.761777	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
36	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 14:22:41.006387	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
37	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 14:40:05.782506	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
38	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 15:12:27.327655	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
39	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 18:27:26.693029	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/2.1.39 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36	4
40	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-11-30 18:27:32.815038	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/2.1.39 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36	4
41	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 11:50:42.447779	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
42	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 13:02:01.007747	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
43	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 14:02:31.098662	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
44	Chrome	DESKTOP	Sai mật khẩu	0:0:0:0:0:0:0:1	Unknown	2025-12-01 15:14:54.704033	FAILED	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
45	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 15:15:06.948783	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
46	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 22:28:23.81809	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
47	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-01 23:28:52.629655	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
48	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-02 00:40:06.19761	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
49	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-02 09:48:56.460189	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
50	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-02 10:49:30.352398	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
51	Chrome	MOBILE	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-02 12:17:50.979939	SUCCESS	Linux	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	4
52	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-03 00:28:44.886922	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
53	Chrome	DESKTOP	\N	0:0:0:0:0:0:0:1	Unknown	2025-12-03 17:07:59.246122	SUCCESS	Windows	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	4
\.


--
-- TOC entry 4793 (class 0 OID 17619)
-- Dependencies: 339
-- Data for Name: member_pricing_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_pricing_tiers (id, benefits_description, benefits_json, card_color_code, card_image_url, created_at, discount_percentage, icon_class, min_points_required, min_purchase_amount, status, tier_display_name, tier_level, tier_name, updated_at) FROM stdin;
\.


--
-- TOC entry 4795 (class 0 OID 17627)
-- Dependencies: 341
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, created_at, gift_name, product_name, quantity, sale_price, sku, subtotal, unit_price, variant_name, gift_product_id, order_id, product_id, product_variant_id, tax_rate, tax_amount, tax_class_id, tax_class_name) FROM stdin;
\.


--
-- TOC entry 4797 (class 0 OID 17635)
-- Dependencies: 343
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, counted_at, counted_towards_lifetime_value, created_at, customer_email, customer_id, customer_name, customer_phone, customer_vip_tier_id, customer_vip_tier_name, delivered_at, discount_amount, email_verified, email_verified_at, notes, order_number, paid_at, payment_method, payment_status, payment_transaction_id, promotion_code, promotion_id, shipped_at, shipping_address, shipping_city, shipping_district, shipping_fee, shipping_method, shipping_postal_code, shipping_status, shipping_ward, status, subtotal, total_amount, tracking_number, updated_at, verification_attempts, verification_blocked_until, verification_code, verification_code_expires_at, verification_last_sent_at, verification_sent_count, verification_sent_limit, vip_discount_amount, vip_discount_percentage, tax_breakdown) FROM stdin;
\.


--
-- TOC entry 4799 (class 0 OID 17643)
-- Dependencies: 345
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, created_at, expires_at, token, used, used_at, user_id) FROM stdin;
\.


--
-- TOC entry 4801 (class 0 OID 17649)
-- Dependencies: 347
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, amount, created_at, gateway_response, paid_at, payment_method, payment_status, refund_amount, refund_reason, refunded_at, transaction_id, updated_at, order_id) FROM stdin;
\.


--
-- TOC entry 4803 (class 0 OID 17657)
-- Dependencies: 349
-- Data for Name: pre_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pre_orders (id, converted_order_id, created_at, customer_email, customer_name, customer_phone, expected_restock_date, notes, notification_sent, notification_sent_at, quantity, status, updated_at, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4805 (class 0 OID 17666)
-- Dependencies: 351
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, created_at, custom_value, display_order, numeric_value, is_primary, scope, attribute_type_id, attribute_option_id, product_id, product_variant_id, unit) FROM stdin;
\.


--
-- TOC entry 4807 (class 0 OID 17675)
-- Dependencies: 353
-- Data for Name: product_bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_bundles (id, bundle_price, bundle_type, created_at, description, discount_amount, discount_percentage, display_order, end_date, image_url, is_customizable, name, original_total_price, slug, start_date, status, updated_at) FROM stdin;
\.


--
-- TOC entry 4809 (class 0 OID 17685)
-- Dependencies: 355
-- Data for Name: product_comparisons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_comparisons (id, compared_at, product_ids, session_id, user_id) FROM stdin;
\.


--
-- TOC entry 4811 (class 0 OID 17693)
-- Dependencies: 357
-- Data for Name: product_conversion_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_conversion_tracking (id, add_to_carts, avg_order_value, avg_view_duration, cart_to_purchase_rate, created_at, date, purchases, revenue, unique_views, updated_at, view_to_cart_rate, view_to_purchase_rate, views, product_id) FROM stdin;
\.


--
-- TOC entry 4813 (class 0 OID 17699)
-- Dependencies: 359
-- Data for Name: product_gifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_gifts (id, created_at, display_order, gift_name, gift_value, is_required, quantity, status, gift_product_id, product_id) FROM stdin;
\.


--
-- TOC entry 4815 (class 0 OID 17705)
-- Dependencies: 361
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, alt_text, created_at, display_order, file_size_bytes, height, image_type, image_url, is_primary, thumbnail_url, width, product_id, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4817 (class 0 OID 17713)
-- Dependencies: 363
-- Data for Name: product_member_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_member_prices (id, created_at, discount_percentage, member_price, updated_at, pricing_tier_id, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4819 (class 0 OID 17719)
-- Dependencies: 365
-- Data for Name: product_price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_price_history (id, change_amount, change_percentage, created_at, effective_from, effective_to, member_price, previous_price, price, price_change_type, promotion_id, promotion_name, sale_price, changed_by, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4821 (class 0 OID 17726)
-- Dependencies: 367
-- Data for Name: product_seo_urls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_seo_urls (id, created_at, new_slug, old_slug, redirect_count, redirect_type, product_id) FROM stdin;
\.


--
-- TOC entry 4823 (class 0 OID 17734)
-- Dependencies: 369
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_specifications (id, created_at, display_order, specification_key, specification_value, product_id) FROM stdin;
\.


--
-- TOC entry 4875 (class 0 OID 19649)
-- Dependencies: 421
-- Data for Name: product_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_stats (product_id, average_rating, total_reviews, total_verified_reviews, total_sold, total_views, last_calculated_at) FROM stdin;
\.


--
-- TOC entry 4825 (class 0 OID 17742)
-- Dependencies: 371
-- Data for Name: product_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_translations (id, created_at, full_description, locale, meta_description, meta_title, name, short_description, status, updated_at, created_by, product_id, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4827 (class 0 OID 17750)
-- Dependencies: 373
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, allow_backorder, allow_out_of_stock_purchase, available_from, available_to, barcode, cached_attributes, concentration_code, cost_price, created_at, currency_code, display_order, full_description, is_default, low_stock_threshold, manage_inventory, meta_description, meta_title, price, reserved_quantity, sale_price, short_description, sku, slug, sold_count, status, stock_quantity, stock_status, tax_class_id, updated_at, variant_name, view_count, volume_ml, volume_unit, weight_grams, weight_unit, category_id, concentration_id, created_by, product_id, updated_by) FROM stdin;
\.


--
-- TOC entry 4829 (class 0 OID 17760)
-- Dependencies: 375
-- Data for Name: product_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_views (id, added_to_cart, added_to_cart_at, ip_address, purchased, purchased_at, referrer_url, session_id, user_agent, utm_campaign, utm_medium, utm_source, view_duration_seconds, viewed_at, order_id, product_id, user_id) FROM stdin;
\.


--
-- TOC entry 4831 (class 0 OID 17768)
-- Dependencies: 377
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, archived_at, created_at, name, published_at, status, updated_at, brand_id, created_by, updated_by) FROM stdin;
\.


--
-- TOC entry 4879 (class 0 OID 19690)
-- Dependencies: 425
-- Data for Name: promotion_applicable_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_applicable_categories (id, promotion_id, category_id, created_at) FROM stdin;
\.


--
-- TOC entry 4877 (class 0 OID 19670)
-- Dependencies: 423
-- Data for Name: promotion_applicable_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_applicable_products (id, promotion_id, product_id, created_at) FROM stdin;
\.


--
-- TOC entry 4833 (class 0 OID 17775)
-- Dependencies: 379
-- Data for Name: promotion_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_usage (id, discount_amount, used_at, customer_id, order_id, promotion_id, user_id) FROM stdin;
\.


--
-- TOC entry 4835 (class 0 OID 17781)
-- Dependencies: 381
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, applicable_brands, applicable_categories, applicable_products, applicable_to, code, created_at, description, discount_type, discount_value, end_date, max_discount_amount, min_purchase_amount, name, start_date, status, updated_at, usage_count, usage_limit, usage_limit_per_user) FROM stdin;
\.


--
-- TOC entry 4871 (class 0 OID 19574)
-- Dependencies: 417
-- Data for Name: refund_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund_items (id, refund_id, order_item_id, product_variant_id, quantity, refund_amount, restocked, restocked_at, restocked_warehouse_id, reason, notes, created_at) FROM stdin;
\.


--
-- TOC entry 4869 (class 0 OID 19543)
-- Dependencies: 415
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (id, order_id, payment_id, refund_number, refund_type, total_refund_amount, refund_reason, refund_notes, status, processed_by, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4837 (class 0 OID 17789)
-- Dependencies: 383
-- Data for Name: related_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.related_products (id, created_at, display_order, relation_type, product_id, related_product_id) FROM stdin;
\.


--
-- TOC entry 4839 (class 0 OID 17795)
-- Dependencies: 385
-- Data for Name: review_helpful; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_helpful (id, created_at, is_helpful, review_id, user_id) FROM stdin;
\.


--
-- TOC entry 4841 (class 0 OID 17801)
-- Dependencies: 387
-- Data for Name: review_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_images (id, created_at, display_order, image_url, review_id) FROM stdin;
\.


--
-- TOC entry 4843 (class 0 OID 17809)
-- Dependencies: 389
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, comment, created_at, helpful_count, is_verified_purchase, moderated_at, order_id, rating, report_count, status, title, updated_at, moderated_by, product_id, user_id) FROM stdin;
\.


--
-- TOC entry 4845 (class 0 OID 17819)
-- Dependencies: 391
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, created_at, description, hierarchy_level, permissions, role_code, role_name, status, updated_at) FROM stdin;
1	2025-11-24 11:05:15.396952	Full system access with all permissions	10	{"*": ["*"]}	SUPER_ADMIN	Super Administrator	ACTIVE	2025-11-24 11:05:15.396952
2	2025-11-24 11:05:16.100311	Full access to all modules except system settings	8	{"brands": ["*"], "orders": ["*"], "products": ["*"], "analytics": ["read"], "customers": ["*"], "inventory": ["*"], "categories": ["*"], "concentrations": ["*"]}	ADMIN	Administrator	ACTIVE	2025-11-24 11:05:16.100311
3	2025-11-24 11:05:16.638247	Can manage products, orders, and view analytics	6	{"orders": ["read", "update"], "products": ["create", "read", "update"], "analytics": ["read"], "customers": ["read"]}	MANAGER	Manager	ACTIVE	2025-11-24 11:05:16.638247
4	2025-11-24 11:05:17.170986	Can view and update orders, limited product access	4	{"orders": ["read", "update"], "products": ["read"], "customers": ["read"]}	STAFF	Staff	ACTIVE	2025-11-24 11:05:17.170986
5	2025-11-24 11:05:17.704915	Read-only access to all modules	2	{"*": ["read"]}	VIEWER	Viewer	ACTIVE	2025-11-24 11:05:17.704915
\.


--
-- TOC entry 4847 (class 0 OID 17827)
-- Dependencies: 393
-- Data for Name: search_queries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_queries (id, clicked_at, created_at, filters_applied, ip_address, query_text, results_count, session_id, user_agent, clicked_product_id, user_id) FROM stdin;
\.


--
-- TOC entry 4849 (class 0 OID 17835)
-- Dependencies: 395
-- Data for Name: seo_urls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seo_urls (id, canonical_url, created_at, entity_id, entity_type, new_url, notes, old_url, redirect_count, redirect_type, status, updated_at, created_by) FROM stdin;
\.


--
-- TOC entry 4872 (class 0 OID 19612)
-- Dependencies: 418
-- Data for Name: shedlock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shedlock (name, lock_until, locked_at, locked_by) FROM stdin;
\.


--
-- TOC entry 4851 (class 0 OID 17843)
-- Dependencies: 397
-- Data for Name: stock_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_alerts (id, alert_type, created_at, current_quantity, notes, notified, notified_at, resolved, resolved_at, threshold_quantity, updated_at, product_variant_id) FROM stdin;
\.


--
-- TOC entry 4874 (class 0 OID 19620)
-- Dependencies: 420
-- Data for Name: stock_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_reservations (id, product_variant_id, warehouse_id, reservation_type, reference_id, quantity, expires_at, status, created_at) FROM stdin;
\.


--
-- TOC entry 4853 (class 0 OID 17852)
-- Dependencies: 399
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_classes (id, country_code, created_at, description, is_default, name, rate, status) FROM stdin;
\.


--
-- TOC entry 4855 (class 0 OID 17860)
-- Dependencies: 401
-- Data for Name: url_slugs_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.url_slugs_history (id, changed_at, entity_id, entity_type, new_slug, old_slug, changed_by) FROM stdin;
\.


--
-- TOC entry 4857 (class 0 OID 17868)
-- Dependencies: 403
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, assigned_at, expires_at, is_active, assigned_by, role_id, user_id) FROM stdin;
2	2025-11-24 11:18:37.079691	\N	t	4	1	4
3	2025-11-24 11:22:25.084413	\N	t	\N	2	5
4	2025-11-24 11:23:48.569159	\N	t	\N	3	6
5	2025-11-24 11:24:13.578794	\N	t	\N	4	7
6	2025-11-24 11:24:55.326733	\N	t	\N	5	8
8	2025-11-24 12:28:59.097723	\N	t	\N	4	10
9	2025-12-01 23:18:24.420441	\N	t	\N	5	11
10	2025-12-01 23:24:06.799189	\N	t	\N	5	12
11	2025-12-01 23:24:36.71648	\N	t	\N	5	13
12	2025-12-01 23:25:00.236099	\N	t	\N	5	14
13	2025-12-01 23:25:37.590299	\N	t	\N	5	15
14	2025-12-01 23:26:07.120077	\N	t	\N	5	16
15	2025-12-01 23:27:15.949542	\N	t	\N	5	17
16	2025-12-01 23:27:40.20043	\N	t	\N	5	18
17	2025-12-01 23:28:18.434143	\N	t	\N	5	19
18	2025-12-01 23:39:54.22694	\N	t	\N	5	20
19	2025-12-02 01:39:26.629418	\N	t	\N	5	21
\.


--
-- TOC entry 4859 (class 0 OID 17874)
-- Dependencies: 405
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, additional_permissions, created_at, email, failed_login_attempts, full_name, last_login, last_login_ip, last_password_reset_request, locked_until, notes, password, password_changed_at, phone, primary_role_id, role, status, updated_at, avatar_url) FROM stdin;
8	{}	2025-11-24 11:24:55.186065	tuhoanggggg.170704@gmail.com	0	 Viewer	\N	\N	\N	\N	\N	$2a$10$3neUL7ndxyy6f7h7guV4/enHeKOw6dCL/nVnGXcnej8hjt6qtKASm	\N	0399194415	\N	ADMIN	INACTIVE	2025-12-01 11:54:16.453978	\N
11	{}	2025-12-01 23:18:24.186138	tuhoaaang.170704@gmail.com	0	testnam	\N	\N	\N	\N	\N	$2a$10$p1T1SIiFaxuX9DimyO0Miu7NVtftnp2cqm7VZ1e.ptxp6nuqkE74W	\N	0399193455	\N	ADMIN	ACTIVE	2025-12-01 23:18:24.186138	\N
12	{}	2025-12-01 23:24:06.571064	tauhoang.170704@gmail.com	0	testsau	\N	\N	\N	\N	\N	$2a$10$7qgfqbSZJJDOwXYzQeS9R.8H61H2y/NCG9ij1fj8ee0Y.E2ZjlPAG	\N	0399193456	\N	ADMIN	ACTIVE	2025-12-01 23:24:06.571064	\N
13	{}	2025-12-01 23:24:36.561912	tduhoang.170704@gmail.com	0	testbay	\N	\N	\N	\N	\N	$2a$10$6/ntE4bMNRZneEdCZMaJYuiwmi7YY5Awm91dVqFpCQk3qstfu3FaK	\N	0399134231	\N	ADMIN	ACTIVE	2025-12-01 23:24:36.561912	\N
14	{}	2025-12-01 23:25:00.088521	tuhaaoang.170704@gmail.com	0	testtam	\N	\N	\N	\N	\N	$2a$10$RDa.m5AOAA3PkD/xxFn/g.nIgccrIDfcSe4XrpsYIO5nojh6rbCN.	\N	0394194476	\N	ADMIN	ACTIVE	2025-12-01 23:25:00.088521	\N
15	{}	2025-12-01 23:25:37.388008	tuhoang.17070e4@gmail.com	0	testchin	\N	\N	\N	\N	\N	$2a$10$59sDBehzFqicsBGUggaGGOwF9PB.K8KZgDPM/k/aqv..q92Ww7ovO	\N	0384194476	\N	ADMIN	ACTIVE	2025-12-01 23:25:37.388008	\N
16	{}	2025-12-01 23:26:06.969462	tuashoang.170704@gmail.com	0	testmuoi	\N	\N	\N	\N	\N	$2a$10$AxtTiuthbtP5ZrB9nbgyA.QNa9jZY5Kgspw1s4kUj3zMsYqvJkJlq	\N	0355194476	\N	ADMIN	ACTIVE	2025-12-01 23:26:06.969462	\N
17	{}	2025-12-01 23:27:15.795813	truhoang.170704@gmail.com	0	testmuoihai	\N	\N	\N	\N	\N	$2a$10$7HtgGHezgj6rJU89O88FduVxrdnkF/2sfWASe5ngN3cTpADuP5aKS	\N	0377194476	\N	ADMIN	ACTIVE	2025-12-01 23:27:15.795813	\N
18	{}	2025-12-01 23:27:40.033219	tuhaasng.170704@gmail.com	0	testmuoibon	\N	\N	\N	\N	\N	$2a$10$5laQcha7rxCanKhlNXh6c.vUw7qcrk/WwbE.PMLue5vZyakAj8lxK	\N	0399157476	\N	ADMIN	ACTIVE	2025-12-01 23:27:40.033219	\N
19	{}	2025-12-01 23:28:18.278218	tuhoangsa.170704@gmail.com	0	testmuoilam	\N	\N	\N	\N	\N	$2a$10$E3NF9m5p1U.yuT3ntoh47.xd75qamrh8FO/J27La1Oq9KjC6.JqDS	\N	0399874476	\N	ADMIN	ACTIVE	2025-12-01 23:28:18.278218	\N
6	{}	2025-11-24 11:23:48.419201	tuhoanggg.170704@gmail.com	0	 Manager	\N	\N	\N	\N	\N	$2a$10$/EpONkSuYrUy7Cdgw2xAWuXvnKr5p7FcIDlNghGCbhsw7lnox0AOW	\N	0399194412	\N	ADMIN	ACTIVE	2025-12-02 01:02:54.940181	http://127.0.0.1:9000/orchard-bucket/users/2025/12/02/bdc9055d-0e3a-451b-885d-2046f4469113.jpg
7	{}	2025-11-24 11:24:13.442509	tuhoangggg.170704@gmail.com	0	Staff	\N	\N	\N	\N	\N	$2a$10$MHx2tkPJ5oJz5rEDAEpP2OLuTMbMLBJ4eVt4WgzpEWOKSjVEEAJ66	\N	0399194413	\N	ADMIN	ACTIVE	2025-12-02 15:12:41.921937	http://127.0.0.1:9000/orchard-bucket/users/2025/12/02/0ada7421-108c-4db7-81a2-1844b8cd24d2.jpg
20	{}	2025-12-01 23:39:54.010247	turrhoang.170704@gmail.com	0	testmuoisau	\N	\N	\N	\N	\N	$2a$10$PKcS0xMwY30qHBISjMw.N.gQLhH6o3hezEwAOgQB6RD3jw5H8Ec1W	\N	0399784476	\N	ADMIN	ACTIVE	2025-12-01 23:39:54.010247	\N
10	{}	2025-11-24 12:28:58.92309	tuhojang.170704@gmail.com	0	ccc	\N	\N	\N	\N	\N	$2a$10$zX7F6nw08KsbIWar6dJ/Xu8xeyOEHuuOijoKfAu0CKA.7sqpNBJR6	\N	0399194233	\N	ADMIN	ACTIVE	2025-12-02 00:54:49.413105	\N
5	{}	2025-11-24 11:22:24.93683	tuhaidau@gmail.com	0	Administrator	2025-11-24 18:31:22.467444	\N	\N	\N	\N	$2a$10$zqvR0I11f8kGiIImFO3hwOjZdtnUtDlEez6yMh.H5uMI2CgeK2QLO	\N	0399194411	\N	ADMIN	ACTIVE	2025-12-02 00:56:36.936614	http://127.0.0.1:9000/orchard-bucket/users/2025/12/02/4b54468b-f1d6-408b-92aa-c2bc1cf8b819.jpg
21	{}	2025-12-02 01:39:26.444896	tuhoasang.170704@gmail.com	0	Viewer	\N	\N	\N	\N	\N	$2a$10$AqpR6UaxD3X9mB8EqFfg.O7pn4Jn2OCoZ.L.1uB9pOd34/kQLrHP2	\N	0398594476	\N	ADMIN	ACTIVE	2025-12-02 01:39:26.444896	\N
4	{}	2025-11-24 11:18:36.805417	tuhoang.170704@gmail.com	0	Super Administrator	2025-12-03 17:07:58.581341	\N	\N	\N	\N	$2a$10$8WbPohodgQOFGccV2XEObunMVipKTBmZ/hNdZIv3sn54fUOsod4P2	2025-11-24 15:04:26.092781	0399194476	1	ADMIN	ACTIVE	2025-12-03 17:07:58.665108	http://127.0.0.1:9000/orchard-bucket/users/2025/12/02/427fb436-780e-4579-bd65-e7f098d970cd.jpg
\.


--
-- TOC entry 4861 (class 0 OID 17884)
-- Dependencies: 407
-- Data for Name: warehouse_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_stock (id, quantity, reserved_quantity, updated_at, product_variant_id, warehouse_id) FROM stdin;
\.


--
-- TOC entry 4863 (class 0 OID 17890)
-- Dependencies: 409
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, address, code, contact_phone, created_at, is_default, name, status) FROM stdin;
\.


--
-- TOC entry 4865 (class 0 OID 17898)
-- Dependencies: 411
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, created_at, product_id, user_id) FROM stdin;
\.


--
-- TOC entry 4751 (class 0 OID 17117)
-- Dependencies: 293
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-11-19 22:48:39
20211116045059	2025-11-19 22:48:40
20211116050929	2025-11-19 22:48:41
20211116051442	2025-11-19 22:48:42
20211116212300	2025-11-19 22:48:43
20211116213355	2025-11-19 22:48:44
20211116213934	2025-11-19 22:48:45
20211116214523	2025-11-19 22:48:46
20211122062447	2025-11-19 22:48:47
20211124070109	2025-11-19 22:48:48
20211202204204	2025-11-19 22:48:49
20211202204605	2025-11-19 22:48:50
20211210212804	2025-11-19 22:48:53
20211228014915	2025-11-19 22:48:54
20220107221237	2025-11-19 22:48:55
20220228202821	2025-11-19 22:48:56
20220312004840	2025-11-19 22:48:57
20220603231003	2025-11-19 22:48:58
20220603232444	2025-11-19 22:48:59
20220615214548	2025-11-19 22:49:00
20220712093339	2025-11-19 22:49:01
20220908172859	2025-11-19 22:49:02
20220916233421	2025-11-19 22:49:03
20230119133233	2025-11-19 22:49:04
20230128025114	2025-11-19 22:49:05
20230128025212	2025-11-19 22:49:06
20230227211149	2025-11-19 22:49:07
20230228184745	2025-11-19 22:49:08
20230308225145	2025-11-19 22:49:09
20230328144023	2025-11-19 22:49:10
20231018144023	2025-11-19 22:49:11
20231204144023	2025-11-19 22:49:12
20231204144024	2025-11-19 22:49:13
20231204144025	2025-11-19 22:49:14
20240108234812	2025-11-19 22:49:15
20240109165339	2025-11-19 22:49:16
20240227174441	2025-11-19 22:49:18
20240311171622	2025-11-19 22:49:19
20240321100241	2025-11-19 22:49:21
20240401105812	2025-11-19 22:49:24
20240418121054	2025-11-19 22:49:25
20240523004032	2025-11-19 22:49:28
20240618124746	2025-11-19 22:49:29
20240801235015	2025-11-19 22:49:30
20240805133720	2025-11-19 22:49:31
20240827160934	2025-11-19 22:49:32
20240919163303	2025-11-19 22:49:33
20240919163305	2025-11-19 22:49:34
20241019105805	2025-11-19 22:49:35
20241030150047	2025-11-19 22:49:39
20241108114728	2025-11-19 22:49:40
20241121104152	2025-11-19 22:49:41
20241130184212	2025-11-19 22:49:42
20241220035512	2025-11-19 22:49:43
20241220123912	2025-11-19 22:49:44
20241224161212	2025-11-19 22:49:45
20250107150512	2025-11-19 22:49:46
20250110162412	2025-11-19 22:49:47
20250123174212	2025-11-19 22:49:48
20250128220012	2025-11-19 22:49:49
20250506224012	2025-11-19 22:49:49
20250523164012	2025-11-19 22:49:50
20250714121412	2025-11-19 22:49:51
20250905041441	2025-11-19 22:49:52
20251103001201	2025-11-19 22:49:53
\.


--
-- TOC entry 4753 (class 0 OID 17139)
-- Dependencies: 296
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- TOC entry 4734 (class 0 OID 16546)
-- Dependencies: 273
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- TOC entry 4757 (class 0 OID 17426)
-- Dependencies: 303
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- TOC entry 4758 (class 0 OID 17453)
-- Dependencies: 304
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4736 (class 0 OID 16588)
-- Dependencies: 275
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-11-19 23:15:06.935825
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-11-19 23:15:06.972104
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-11-19 23:15:06.9767
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-11-19 23:15:07.071294
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-11-19 23:15:07.185093
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-11-19 23:15:07.190247
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-11-19 23:15:07.197169
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-11-19 23:15:07.204343
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-11-19 23:15:07.208971
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-11-19 23:15:07.215506
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-11-19 23:15:07.222358
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-11-19 23:15:07.228452
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-11-19 23:15:07.239901
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-11-19 23:15:07.244764
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-11-19 23:15:07.249797
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-11-19 23:15:07.29741
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-11-19 23:15:07.303876
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-11-19 23:15:07.308808
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-11-19 23:15:07.321064
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-11-19 23:15:07.329527
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-11-19 23:15:07.335547
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-11-19 23:15:07.344909
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-11-19 23:15:07.367553
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-11-19 23:15:07.377628
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-11-19 23:15:07.382996
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-11-19 23:15:07.388172
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-11-19 23:15:07.393345
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-11-19 23:15:07.410699
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-11-19 23:15:07.420654
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-11-19 23:15:07.428708
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-11-19 23:15:07.435014
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-11-19 23:15:07.441825
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-11-19 23:15:07.4494
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-11-19 23:15:07.461973
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-11-19 23:15:07.463932
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-11-19 23:15:07.470759
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-11-19 23:15:07.475761
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-11-19 23:15:07.483335
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-11-19 23:15:07.488497
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-11-19 23:15:07.502874
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-11-19 23:15:07.508037
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-11-19 23:15:07.516598
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-11-19 23:15:07.522454
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-11-19 23:15:07.529747
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-19 23:15:07.537591
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-19 23:15:07.542735
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-11-19 23:15:07.556597
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-11-19 23:15:07.561817
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2025-11-19 23:15:07.567083
\.


--
-- TOC entry 4735 (class 0 OID 16561)
-- Dependencies: 274
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- TOC entry 4756 (class 0 OID 17382)
-- Dependencies: 302
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4754 (class 0 OID 17329)
-- Dependencies: 300
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- TOC entry 4755 (class 0 OID 17343)
-- Dependencies: 301
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- TOC entry 4759 (class 0 OID 17463)
-- Dependencies: 305
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4866 (class 0 OID 19527)
-- Dependencies: 412
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key, rollback) FROM stdin;
20251127050306	{"-- 1. Thêm cột snapshot thuế vào order_items\nALTER TABLE order_items\nADD COLUMN tax_rate DECIMAL(5,2),\nADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0,\nADD COLUMN tax_class_id BIGINT,\nADD COLUMN tax_class_name VARCHAR(100);\n\n-- 2. Thêm cột JSONB để lưu cấu trúc thuế phức tạp vào orders\nALTER TABLE orders\nADD COLUMN tax_breakdown JSONB;\n\n-- 3. Tạo Index & Constraints\nCREATE INDEX idx_order_items_tax_rate ON order_items(tax_rate);\nCREATE INDEX idx_order_items_tax_class ON order_items(tax_class_id);\n\n-- Check constraints để đảm bảo data sạch\nALTER TABLE order_items\nADD CONSTRAINT chk_order_items_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),\nADD CONSTRAINT chk_order_items_tax_amount CHECK (tax_amount >= 0);\n\n-- 4. Comment\nCOMMENT ON COLUMN order_items.tax_rate IS 'Thuế suất tại thời điểm mua (Snapshot)';\nCOMMENT ON COLUMN orders.tax_breakdown IS 'Cấu trúc thuế chi tiết (JSON) tại thời điểm mua';"}	add_tax_snapshot	tuhoang.170704@gmail.com	\N	\N
20251127050310	{"-- 1. Tạo Sequence (QUAN TRỌNG: Phải tạo trước bảng)\nCREATE SEQUENCE refund_number_seq START 1;\n\n-- 2. Bảng Refunds\nCREATE TABLE refunds (\n    id BIGSERIAL PRIMARY KEY,\n    order_id BIGINT NOT NULL,\n    payment_id BIGINT,\n    refund_number VARCHAR(50) UNIQUE NOT NULL,\n    refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('FULL', 'PARTIAL', 'ITEM')),\n    total_refund_amount DECIMAL(15,2) NOT NULL,\n    refund_reason VARCHAR(100),\n    refund_notes TEXT,\n    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),\n    processed_by BIGINT,\n    processed_at TIMESTAMP,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (order_id) REFERENCES orders(id),\n    FOREIGN KEY (payment_id) REFERENCES payments(id),\n    FOREIGN KEY (processed_by) REFERENCES users(id)\n);\n\n-- 3. Bảng Refund Items\nCREATE TABLE refund_items (\n    id BIGSERIAL PRIMARY KEY,\n    refund_id BIGINT NOT NULL,\n    order_item_id BIGINT NOT NULL,\n    product_variant_id BIGINT NOT NULL,\n    quantity INTEGER NOT NULL,\n    refund_amount DECIMAL(15,2) NOT NULL,\n    restocked BOOLEAN DEFAULT FALSE,\n    restocked_at TIMESTAMP,\n    restocked_warehouse_id BIGINT,\n    reason VARCHAR(100),\n    notes TEXT,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE CASCADE,\n    FOREIGN KEY (order_item_id) REFERENCES order_items(id),\n    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),\n    FOREIGN KEY (restocked_warehouse_id) REFERENCES warehouses(id)\n);\n\n-- 4. Indexes & Constraints (Đã bổ sung từ Review)\nCREATE INDEX idx_refunds_order ON refunds(order_id);\nCREATE INDEX idx_refunds_refund_number ON refunds(refund_number);\nCREATE INDEX idx_refunds_status ON refunds(status);\nCREATE INDEX idx_refunds_payment ON refunds(payment_id);\nCREATE INDEX idx_refund_items_refund ON refund_items(refund_id);\nCREATE INDEX idx_refund_items_restocked ON refund_items(restocked) WHERE restocked = false;\n\nALTER TABLE refund_items\nADD CONSTRAINT chk_refund_items_quantity CHECK (quantity > 0),\nADD CONSTRAINT chk_refund_items_refund_amount CHECK (refund_amount >= 0);"}	add_refunds_and_sequence	tuhoang.170704@gmail.com	\N	\N
20251127050322	{"-- 1. Bảng ShedLock\nCREATE TABLE IF NOT EXISTS shedlock (\n    name VARCHAR(64) NOT NULL PRIMARY KEY,\n    lock_until TIMESTAMP NOT NULL,\n    locked_at TIMESTAMP NOT NULL,\n    locked_by VARCHAR(255) NOT NULL\n);\n\n-- 2. Constraints cho Warehouse Stock\nALTER TABLE warehouse_stock\nADD CONSTRAINT chk_warehouse_stock_quantity CHECK (quantity >= 0),\nADD CONSTRAINT chk_warehouse_stock_reserved CHECK (reserved_quantity <= quantity);\n\n-- 3. Bảng Stock Reservations\nCREATE TABLE stock_reservations (\n    id BIGSERIAL PRIMARY KEY,\n    product_variant_id BIGINT NOT NULL,\n    warehouse_id BIGINT NOT NULL,\n    reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN ('CART', 'CHECKOUT', 'ORDER')),\n    reference_id BIGINT,\n    quantity INTEGER NOT NULL CHECK (quantity > 0),\n    expires_at TIMESTAMP NOT NULL,\n    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONSUMED', 'RELEASED')),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE(product_variant_id, warehouse_id, reference_id, reservation_type),\n    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),\n    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)\n);\n\nCREATE INDEX idx_stock_reservations_variant ON stock_reservations(product_variant_id, warehouse_id);\nCREATE INDEX idx_stock_reservations_expires ON stock_reservations(expires_at) WHERE status = 'ACTIVE';\nCREATE INDEX idx_stock_reservations_reference ON stock_reservations(reference_id, reservation_type);\nCREATE INDEX idx_stock_reservations_status ON stock_reservations(status);\n\n-- 4. Trigger Sync (Phiên bản hoàn thiện nhất)\nCREATE OR REPLACE FUNCTION sync_reserved_quantity_to_warehouse_stock()\nRETURNS TRIGGER AS $$\nBEGIN\n    -- Trường hợp 1: Tạo mới Reservation\n    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN\n        UPDATE warehouse_stock\n        SET reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity\n        WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;\n    \n    -- Trường hợp 2: Update trạng thái hoặc số lượng\n    ELSIF TG_OP = 'UPDATE' THEN\n        -- Reservation hết hạn hoặc được giải phóng -> Trừ reserved_quantity\n        IF OLD.status = 'ACTIVE' AND NEW.status IN ('EXPIRED', 'RELEASED', 'CONSUMED') THEN\n            UPDATE warehouse_stock\n            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)\n            WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;\n        \n        -- Thay đổi số lượng reservation khi đang ACTIVE (hiếm gặp nhưng cần xử lý)\n        ELSIF OLD.status = 'ACTIVE' AND NEW.status = 'ACTIVE' AND OLD.quantity != NEW.quantity THEN\n            UPDATE warehouse_stock\n            SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity + NEW.quantity, 0)\n            WHERE product_variant_id = NEW.product_variant_id AND warehouse_id = NEW.warehouse_id;\n        END IF;\n    -- Trường hợp 3: Xóa Reservation (DELETE) -> Trừ reserved_quantity\n    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN\n        UPDATE warehouse_stock\n        SET reserved_quantity = GREATEST(COALESCE(reserved_quantity, 0) - OLD.quantity, 0)\n        WHERE product_variant_id = OLD.product_variant_id AND warehouse_id = OLD.warehouse_id;\n        RETURN OLD;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trg_sync_reserved_quantity\nAFTER INSERT OR UPDATE OR DELETE ON stock_reservations\nFOR EACH ROW\nEXECUTE FUNCTION sync_reserved_quantity_to_warehouse_stock();"}	add_stock_reservations	tuhoang.170704@gmail.com	\N	\N
20251127050331	{"-- 1. Bảng Product Stats\nCREATE TABLE product_stats (\n    product_id BIGINT PRIMARY KEY,\n    average_rating DECIMAL(3,2) DEFAULT 0,\n    total_reviews INTEGER DEFAULT 0,\n    total_verified_reviews INTEGER DEFAULT 0,\n    total_sold INTEGER DEFAULT 0,\n    total_views INTEGER DEFAULT 0,\n    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE\n);\n\n-- Constraints\nALTER TABLE product_stats\nADD CONSTRAINT chk_product_stats_rating CHECK (average_rating >= 0 AND average_rating <= 5),\nADD CONSTRAINT chk_product_stats_counts CHECK (total_reviews >= 0 AND total_sold >= 0);\n\n-- 2. Trigger Update Review (Handle cả INSERT, UPDATE, DELETE)\nCREATE OR REPLACE FUNCTION update_product_stats_on_review()\nRETURNS TRIGGER AS $$\nDECLARE\n    affected_product_id BIGINT;\nBEGIN\n    -- Xác định product_id bị ảnh hưởng\n    IF TG_OP = 'DELETE' THEN\n        affected_product_id := OLD.product_id;\n    ELSE\n        affected_product_id := NEW.product_id;\n    END IF;\n\n    -- Update stats\n    INSERT INTO product_stats (product_id, average_rating, total_reviews, total_verified_reviews)\n    SELECT\n        affected_product_id,\n        COALESCE(AVG(rating)::DECIMAL(3,2), 0),\n        COUNT(*),\n        COUNT(*) FILTER (WHERE is_verified_purchase = true)\n    FROM reviews\n    WHERE product_id = affected_product_id AND status = 'APPROVED'\n    ON CONFLICT (product_id) DO UPDATE SET\n        average_rating = EXCLUDED.average_rating,\n        total_reviews = EXCLUDED.total_reviews,\n        total_verified_reviews = EXCLUDED.total_verified_reviews,\n        last_calculated_at = CURRENT_TIMESTAMP;\n\n    -- Xử lý trường hợp không còn review nào -> Reset về 0\n    IF NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = affected_product_id AND status = 'APPROVED') THEN\n        UPDATE product_stats\n        SET average_rating = 0, total_reviews = 0, total_verified_reviews = 0\n        WHERE product_id = affected_product_id;\n    END IF;\n\n    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER trg_update_product_stats_review\nAFTER INSERT OR UPDATE OR DELETE ON reviews\nFOR EACH ROW\nEXECUTE FUNCTION update_product_stats_on_review();"}	add_product_stats	tuhoang.170704@gmail.com	\N	\N
20251127050337	{"-- 1. Bảng quan hệ Many-to-Many\nCREATE TABLE promotion_applicable_products (\n    id BIGSERIAL PRIMARY KEY,\n    promotion_id BIGINT NOT NULL,\n    product_id BIGINT NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE(promotion_id, product_id),\n    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,\n    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE\n);\n\nCREATE TABLE promotion_applicable_categories (\n    id BIGSERIAL PRIMARY KEY,\n    promotion_id BIGINT NOT NULL,\n    category_id BIGINT NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    UNIQUE(promotion_id, category_id),\n    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,\n    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE\n);\n\n-- 2. Indexes cho tốc độ\nCREATE INDEX idx_promo_app_prod_promo ON promotion_applicable_products(promotion_id);\nCREATE INDEX idx_promo_app_prod_prod ON promotion_applicable_products(product_id);\nCREATE INDEX idx_promo_app_cat_promo ON promotion_applicable_categories(promotion_id);\nCREATE INDEX idx_promo_app_cat_cat ON promotion_applicable_categories(category_id);\n\n-- 3. MIGRATE DATA (Chuyển dữ liệu cũ từ JSONB sang bảng mới)\n\n-- Migrate Products\nINSERT INTO promotion_applicable_products (promotion_id, product_id)\nSELECT \n    p.id AS promotion_id,\n    (jsonb_array_elements_text(p.applicable_products)::BIGINT) AS product_id\nFROM promotions p\nWHERE p.applicable_products IS NOT NULL \n  AND jsonb_array_length(p.applicable_products) > 0\nON CONFLICT DO NOTHING;\n\n-- Migrate Categories\nINSERT INTO promotion_applicable_categories (promotion_id, category_id)\nSELECT \n    p.id AS promotion_id,\n    (jsonb_array_elements_text(p.applicable_categories)::BIGINT) AS category_id\nFROM promotions p\nWHERE p.applicable_categories IS NOT NULL \n  AND jsonb_array_length(p.applicable_categories) > 0\nON CONFLICT DO NOTHING;"}	refactor_promotions	tuhoang.170704@gmail.com	\N	\N
\.


--
-- TOC entry 3896 (class 0 OID 16658)
-- Dependencies: 276
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 268
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 306
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 1, false);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 308
-- Name: attribute_option_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribute_option_translations_id_seq', 1, false);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 310
-- Name: attribute_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribute_options_id_seq', 5, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 312
-- Name: attribute_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attribute_types_id_seq', 2, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 314
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brands_id_seq', 30, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 316
-- Name: bundle_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bundle_items_id_seq', 1, false);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 318
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, false);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 320
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 23, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 322
-- Name: category_attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_attributes_id_seq', 1, false);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 324
-- Name: concentrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.concentrations_id_seq', 3, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 326
-- Name: currency_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currency_rates_id_seq', 1, false);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 328
-- Name: customer_lifetime_value_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_lifetime_value_id_seq', 1, false);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 330
-- Name: customer_vip_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_vip_history_id_seq', 1, false);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 332
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 426
-- Name: image_deletion_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.image_deletion_queue_id_seq', 91, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 334
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 1, false);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 336
-- Name: login_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_history_id_seq', 53, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 338
-- Name: member_pricing_tiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_pricing_tiers_id_seq', 1, false);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 340
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 342
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 344
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 346
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 348
-- Name: pre_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pre_orders_id_seq', 1, false);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 350
-- Name: product_attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_attributes_id_seq', 1, false);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 352
-- Name: product_bundles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_bundles_id_seq', 1, false);


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 354
-- Name: product_comparisons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_comparisons_id_seq', 1, false);


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 356
-- Name: product_conversion_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_conversion_tracking_id_seq', 1, false);


--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 358
-- Name: product_gifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_gifts_id_seq', 1, false);


--
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 360
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 10, true);


--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 362
-- Name: product_member_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_member_prices_id_seq', 1, false);


--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 364
-- Name: product_price_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_price_history_id_seq', 1, false);


--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 366
-- Name: product_seo_urls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_seo_urls_id_seq', 10, true);


--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 368
-- Name: product_specifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_specifications_id_seq', 1, false);


--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 370
-- Name: product_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_translations_id_seq', 1, false);


--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 372
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 20, true);


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 374
-- Name: product_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_views_id_seq', 1, false);


--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 376
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 12, true);


--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 424
-- Name: promotion_applicable_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_applicable_categories_id_seq', 1, false);


--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 422
-- Name: promotion_applicable_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_applicable_products_id_seq', 1, false);


--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 378
-- Name: promotion_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_usage_id_seq', 1, false);


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 380
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_id_seq', 1, false);


--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 416
-- Name: refund_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refund_items_id_seq', 1, false);


--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 413
-- Name: refund_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refund_number_seq', 1, false);


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 414
-- Name: refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refunds_id_seq', 1, false);


--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 382
-- Name: related_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.related_products_id_seq', 1, false);


--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 384
-- Name: review_helpful_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_helpful_id_seq', 1, false);


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 386
-- Name: review_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_images_id_seq', 1, false);


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 388
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 390
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 392
-- Name: search_queries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_queries_id_seq', 1, false);


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 394
-- Name: seo_urls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seo_urls_id_seq', 1, false);


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 396
-- Name: stock_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_alerts_id_seq', 1, false);


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 419
-- Name: stock_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_reservations_id_seq', 1, false);


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 398
-- Name: tax_classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tax_classes_id_seq', 1, false);


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 400
-- Name: url_slugs_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.url_slugs_history_id_seq', 1, false);


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 402
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 19, true);


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 404
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 406
-- Name: warehouse_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouse_stock_id_seq', 1, false);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 408
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 410
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 295
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- TOC entry 4121 (class 2606 OID 16829)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4075 (class 2606 OID 16531)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4144 (class 2606 OID 16935)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4099 (class 2606 OID 16953)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4101 (class 2606 OID 16963)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4073 (class 2606 OID 16524)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4123 (class 2606 OID 16822)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4119 (class 2606 OID 16810)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4111 (class 2606 OID 17003)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4113 (class 2606 OID 16797)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4157 (class 2606 OID 17062)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 4159 (class 2606 OID 17060)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 4161 (class 2606 OID 17058)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4154 (class 2606 OID 17022)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4165 (class 2606 OID 17084)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4167 (class 2606 OID 17086)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 4148 (class 2606 OID 16988)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4067 (class 2606 OID 16514)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4070 (class 2606 OID 16740)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4133 (class 2606 OID 16869)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4135 (class 2606 OID 16867)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4140 (class 2606 OID 16883)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4078 (class 2606 OID 16537)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4106 (class 2606 OID 16761)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4130 (class 2606 OID 16850)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4125 (class 2606 OID 16841)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4060 (class 2606 OID 16923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4062 (class 2606 OID 16501)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4195 (class 2606 OID 17496)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4197 (class 2606 OID 17502)
-- Name: attribute_option_translations attribute_option_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_option_translations
    ADD CONSTRAINT attribute_option_translations_pkey PRIMARY KEY (id);


--
-- TOC entry 4201 (class 2606 OID 17510)
-- Name: attribute_options attribute_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_options
    ADD CONSTRAINT attribute_options_pkey PRIMARY KEY (id);


--
-- TOC entry 4203 (class 2606 OID 17520)
-- Name: attribute_types attribute_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_types
    ADD CONSTRAINT attribute_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4207 (class 2606 OID 17529)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 17535)
-- Name: bundle_items bundle_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT bundle_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4215 (class 2606 OID 17541)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4221 (class 2606 OID 17550)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4225 (class 2606 OID 17556)
-- Name: category_attributes category_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_pkey PRIMARY KEY (id);


--
-- TOC entry 4229 (class 2606 OID 17565)
-- Name: concentrations concentrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concentrations
    ADD CONSTRAINT concentrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4235 (class 2606 OID 17571)
-- Name: currency_rates currency_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 4239 (class 2606 OID 17580)
-- Name: customer_lifetime_value customer_lifetime_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_lifetime_value
    ADD CONSTRAINT customer_lifetime_value_pkey PRIMARY KEY (id);


--
-- TOC entry 4241 (class 2606 OID 17589)
-- Name: customer_vip_history customer_vip_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vip_history
    ADD CONSTRAINT customer_vip_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4243 (class 2606 OID 17599)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4422 (class 2606 OID 20851)
-- Name: image_deletion_queue image_deletion_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image_deletion_queue
    ADD CONSTRAINT image_deletion_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 4247 (class 2606 OID 17608)
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4249 (class 2606 OID 17617)
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4251 (class 2606 OID 17625)
-- Name: member_pricing_tiers member_pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pricing_tiers
    ADD CONSTRAINT member_pricing_tiers_pkey PRIMARY KEY (id);


--
-- TOC entry 4257 (class 2606 OID 17633)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4259 (class 2606 OID 17641)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4263 (class 2606 OID 17647)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4267 (class 2606 OID 17655)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4271 (class 2606 OID 17664)
-- Name: pre_orders pre_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_orders
    ADD CONSTRAINT pre_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4274 (class 2606 OID 17673)
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- TOC entry 4276 (class 2606 OID 17683)
-- Name: product_bundles product_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_pkey PRIMARY KEY (id);


--
-- TOC entry 4280 (class 2606 OID 17691)
-- Name: product_comparisons product_comparisons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_comparisons
    ADD CONSTRAINT product_comparisons_pkey PRIMARY KEY (id);


--
-- TOC entry 4286 (class 2606 OID 17697)
-- Name: product_conversion_tracking product_conversion_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conversion_tracking
    ADD CONSTRAINT product_conversion_tracking_pkey PRIMARY KEY (id);


--
-- TOC entry 4290 (class 2606 OID 17703)
-- Name: product_gifts product_gifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_gifts
    ADD CONSTRAINT product_gifts_pkey PRIMARY KEY (id);


--
-- TOC entry 4292 (class 2606 OID 17711)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4294 (class 2606 OID 17717)
-- Name: product_member_prices product_member_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_member_prices
    ADD CONSTRAINT product_member_prices_pkey PRIMARY KEY (id);


--
-- TOC entry 4298 (class 2606 OID 17724)
-- Name: product_price_history product_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_price_history
    ADD CONSTRAINT product_price_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4300 (class 2606 OID 17732)
-- Name: product_seo_urls product_seo_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_seo_urls
    ADD CONSTRAINT product_seo_urls_pkey PRIMARY KEY (id);


--
-- TOC entry 4304 (class 2606 OID 17740)
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4405 (class 2606 OID 19659)
-- Name: product_stats product_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_stats
    ADD CONSTRAINT product_stats_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4306 (class 2606 OID 17748)
-- Name: product_translations product_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT product_translations_pkey PRIMARY KEY (id);


--
-- TOC entry 4311 (class 2606 OID 17758)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 4317 (class 2606 OID 17766)
-- Name: product_views product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_pkey PRIMARY KEY (id);


--
-- TOC entry 4319 (class 2606 OID 17773)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4415 (class 2606 OID 19696)
-- Name: promotion_applicable_categories promotion_applicable_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_categories
    ADD CONSTRAINT promotion_applicable_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4417 (class 2606 OID 19698)
-- Name: promotion_applicable_categories promotion_applicable_categories_promotion_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_categories
    ADD CONSTRAINT promotion_applicable_categories_promotion_id_category_id_key UNIQUE (promotion_id, category_id);


--
-- TOC entry 4409 (class 2606 OID 19676)
-- Name: promotion_applicable_products promotion_applicable_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_products
    ADD CONSTRAINT promotion_applicable_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4411 (class 2606 OID 19678)
-- Name: promotion_applicable_products promotion_applicable_products_promotion_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_products
    ADD CONSTRAINT promotion_applicable_products_promotion_id_product_id_key UNIQUE (promotion_id, product_id);


--
-- TOC entry 4321 (class 2606 OID 17779)
-- Name: promotion_usage promotion_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_usage
    ADD CONSTRAINT promotion_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 4323 (class 2606 OID 17787)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4393 (class 2606 OID 19583)
-- Name: refund_items refund_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items
    ADD CONSTRAINT refund_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4387 (class 2606 OID 19555)
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 4389 (class 2606 OID 19557)
-- Name: refunds refunds_refund_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_refund_number_key UNIQUE (refund_number);


--
-- TOC entry 4327 (class 2606 OID 17793)
-- Name: related_products related_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4331 (class 2606 OID 17799)
-- Name: review_helpful review_helpful_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpful
    ADD CONSTRAINT review_helpful_pkey PRIMARY KEY (id);


--
-- TOC entry 4335 (class 2606 OID 17807)
-- Name: review_images review_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4337 (class 2606 OID 17817)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4339 (class 2606 OID 17825)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4343 (class 2606 OID 17833)
-- Name: search_queries search_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT search_queries_pkey PRIMARY KEY (id);


--
-- TOC entry 4345 (class 2606 OID 17841)
-- Name: seo_urls seo_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_urls
    ADD CONSTRAINT seo_urls_pkey PRIMARY KEY (id);


--
-- TOC entry 4395 (class 2606 OID 19616)
-- Name: shedlock shedlock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shedlock
    ADD CONSTRAINT shedlock_pkey PRIMARY KEY (name);


--
-- TOC entry 4349 (class 2606 OID 17850)
-- Name: stock_alerts stock_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_alerts
    ADD CONSTRAINT stock_alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 4401 (class 2606 OID 19630)
-- Name: stock_reservations stock_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_reservations
    ADD CONSTRAINT stock_reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 4403 (class 2606 OID 19632)
-- Name: stock_reservations stock_reservations_product_variant_id_warehouse_id_referenc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_reservations
    ADD CONSTRAINT stock_reservations_product_variant_id_warehouse_id_referenc_key UNIQUE (product_variant_id, warehouse_id, reference_id, reservation_type);


--
-- TOC entry 4351 (class 2606 OID 17858)
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 4278 (class 2606 OID 17934)
-- Name: product_bundles uk1p59l1vojpuomxy8bl919bnkw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT uk1p59l1vojpuomxy8bl919bnkw UNIQUE (slug);


--
-- TOC entry 4296 (class 2606 OID 17942)
-- Name: product_member_prices uk1x7ull2kubvi36r2so17ighp6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_member_prices
    ADD CONSTRAINT uk1x7ull2kubvi36r2so17ighp6 UNIQUE (product_variant_id, pricing_tier_id);


--
-- TOC entry 4288 (class 2606 OID 17940)
-- Name: product_conversion_tracking uk2eygl7cecxo9hticp55ttratt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conversion_tracking
    ADD CONSTRAINT uk2eygl7cecxo9hticp55ttratt UNIQUE (product_id, date);


--
-- TOC entry 4237 (class 2606 OID 17922)
-- Name: currency_rates uk2g3j7fn7pmnu75fmy47thng9h; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT uk2g3j7fn7pmnu75fmy47thng9h UNIQUE (base_currency, target_currency, effective_from);


--
-- TOC entry 4199 (class 2606 OID 17904)
-- Name: attribute_option_translations uk55alrha16wxam6f9ygxni6wmw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_option_translations
    ADD CONSTRAINT uk55alrha16wxam6f9ygxni6wmw UNIQUE (attribute_option_id, locale);


--
-- TOC entry 4363 (class 2606 OID 17965)
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- TOC entry 4302 (class 2606 OID 17944)
-- Name: product_seo_urls uk6e58kgwxksv8yyt1dgdmloktd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_seo_urls
    ADD CONSTRAINT uk6e58kgwxksv8yyt1dgdmloktd UNIQUE (old_slug);


--
-- TOC entry 4371 (class 2606 OID 17969)
-- Name: warehouses uk6herdbg4x5wp6gkor8epv73oc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT uk6herdbg4x5wp6gkor8epv73oc UNIQUE (code);


--
-- TOC entry 4213 (class 2606 OID 17910)
-- Name: bundle_items uk6x0upkj047po0csoxfwp2tg8t; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT uk6x0upkj047po0csoxfwp2tg8t UNIQUE (bundle_id, product_id, product_variant_id);


--
-- TOC entry 4265 (class 2606 OID 17930)
-- Name: password_reset_tokens uk71lqwbwtklmljk3qlsugr1mig; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT uk71lqwbwtklmljk3qlsugr1mig UNIQUE (token);


--
-- TOC entry 4233 (class 2606 OID 17920)
-- Name: concentrations uk8e1wjotphdhplwmin0jj7gfoy; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concentrations
    ADD CONSTRAINT uk8e1wjotphdhplwmin0jj7gfoy UNIQUE (slug);


--
-- TOC entry 4341 (class 2606 OID 17959)
-- Name: roles uk949pwsnk7kxk0px0tbj3r3web; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk949pwsnk7kxk0px0tbj3r3web UNIQUE (role_code);


--
-- TOC entry 4282 (class 2606 OID 17938)
-- Name: product_comparisons uk9pjyieefb97a05c7j2mguf0ob; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_comparisons
    ADD CONSTRAINT uk9pjyieefb97a05c7j2mguf0ob UNIQUE (session_id, product_ids);


--
-- TOC entry 4355 (class 2606 OID 17963)
-- Name: user_roles uka9dydk3dj4qb8cvmjijqnrg5t; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT uka9dydk3dj4qb8cvmjijqnrg5t UNIQUE (user_id, role_id);


--
-- TOC entry 4367 (class 2606 OID 17967)
-- Name: warehouse_stock ukb6a5pc4pcvxuerbtdk8x06pv; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_stock
    ADD CONSTRAINT ukb6a5pc4pcvxuerbtdk8x06pv UNIQUE (product_variant_id, warehouse_id);


--
-- TOC entry 4227 (class 2606 OID 17918)
-- Name: category_attributes ukb6sk90ixuyoj4nfaj7yg4q9lq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT ukb6sk90ixuyoj4nfaj7yg4q9lq UNIQUE (category_id, attribute_id);


--
-- TOC entry 4308 (class 2606 OID 17946)
-- Name: product_translations ukbt1d42v4jyo1lxea9eo2r9cbo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT ukbt1d42v4jyo1lxea9eo2r9cbo UNIQUE (product_variant_id, locale);


--
-- TOC entry 4347 (class 2606 OID 17961)
-- Name: seo_urls uke74arrae8vpkcvdbk2that7og; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_urls
    ADD CONSTRAINT uke74arrae8vpkcvdbk2that7og UNIQUE (old_url);


--
-- TOC entry 4217 (class 2606 OID 17912)
-- Name: carts ukhitqsf6n3rt5kusc0r4cn5xdb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT ukhitqsf6n3rt5kusc0r4cn5xdb UNIQUE (customer_id, product_variant_id);


--
-- TOC entry 4375 (class 2606 OID 17971)
-- Name: wishlists ukht6e6158srxsvjciahp1kjywf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT ukht6e6158srxsvjciahp1kjywf UNIQUE (user_id, product_id);


--
-- TOC entry 4325 (class 2606 OID 17953)
-- Name: promotions ukjdho73ymbyu46p2hh562dk4kk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT ukjdho73ymbyu46p2hh562dk4kk UNIQUE (code);


--
-- TOC entry 4269 (class 2606 OID 17932)
-- Name: payments uklryndveuwa4k5qthti0pkmtlx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT uklryndveuwa4k5qthti0pkmtlx UNIQUE (transaction_id);


--
-- TOC entry 4245 (class 2606 OID 17924)
-- Name: customers ukm3iom37efaxd5eucmxjqqcbe9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT ukm3iom37efaxd5eucmxjqqcbe9 UNIQUE (phone);


--
-- TOC entry 4253 (class 2606 OID 17926)
-- Name: member_pricing_tiers ukndbmn32j1eu8p49v5egndud4c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pricing_tiers
    ADD CONSTRAINT ukndbmn32j1eu8p49v5egndud4c UNIQUE (tier_name);


--
-- TOC entry 4333 (class 2606 OID 17957)
-- Name: review_helpful uknqmr1xifhj48h7f2uelxufwam; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpful
    ADD CONSTRAINT uknqmr1xifhj48h7f2uelxufwam UNIQUE (review_id, user_id);


--
-- TOC entry 4261 (class 2606 OID 17928)
-- Name: orders uknthkiu7pgmnqnu86i2jyoe2v7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT uknthkiu7pgmnqnu86i2jyoe2v7 UNIQUE (order_number);


--
-- TOC entry 4329 (class 2606 OID 17955)
-- Name: related_products ukodkv8arrdj2au5j3007enjo9r; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT ukodkv8arrdj2au5j3007enjo9r UNIQUE (product_id, related_product_id);


--
-- TOC entry 4284 (class 2606 OID 17936)
-- Name: product_comparisons ukoijfx7vmbfdekkaa67k82h1t0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_comparisons
    ADD CONSTRAINT ukoijfx7vmbfdekkaa67k82h1t0 UNIQUE (user_id, product_ids);


--
-- TOC entry 4223 (class 2606 OID 17916)
-- Name: categories ukoul14ho7bctbefv8jywp5v3i2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT ukoul14ho7bctbefv8jywp5v3i2 UNIQUE (slug);


--
-- TOC entry 4209 (class 2606 OID 17908)
-- Name: brands ukpnhnc9urm6fro7oseu9vka70q; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT ukpnhnc9urm6fro7oseu9vka70q UNIQUE (slug);


--
-- TOC entry 4219 (class 2606 OID 17914)
-- Name: carts ukq0nn8pj9e9w8x6qru83ywt5y1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT ukq0nn8pj9e9w8x6qru83ywt5y1 UNIQUE (session_id, product_variant_id);


--
-- TOC entry 4313 (class 2606 OID 17949)
-- Name: product_variants ukq935p2d1pbjm39n0063ghnfgn; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT ukq935p2d1pbjm39n0063ghnfgn UNIQUE (sku);


--
-- TOC entry 4315 (class 2606 OID 17951)
-- Name: product_variants uks77qg18js4yuu1dnrgjy6oldb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT uks77qg18js4yuu1dnrgjy6oldb UNIQUE (slug);


--
-- TOC entry 4205 (class 2606 OID 17906)
-- Name: attribute_types uksljpqsvry0iu6648ljedehh5p; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_types
    ADD CONSTRAINT uksljpqsvry0iu6648ljedehh5p UNIQUE (attribute_key);


--
-- TOC entry 4353 (class 2606 OID 17866)
-- Name: url_slugs_history url_slugs_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.url_slugs_history
    ADD CONSTRAINT url_slugs_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4357 (class 2606 OID 17872)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4365 (class 2606 OID 17882)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4369 (class 2606 OID 17888)
-- Name: warehouse_stock warehouse_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_stock
    ADD CONSTRAINT warehouse_stock_pkey PRIMARY KEY (id);


--
-- TOC entry 4373 (class 2606 OID 17896)
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- TOC entry 4377 (class 2606 OID 17902)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 4177 (class 2606 OID 17293)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4173 (class 2606 OID 17147)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4170 (class 2606 OID 17121)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4187 (class 2606 OID 17486)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4081 (class 2606 OID 16554)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4190 (class 2606 OID 17462)
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- TOC entry 4091 (class 2606 OID 16595)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4093 (class 2606 OID 16593)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4089 (class 2606 OID 16571)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4185 (class 2606 OID 17391)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4182 (class 2606 OID 17352)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4180 (class 2606 OID 17337)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4193 (class 2606 OID 17472)
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- TOC entry 4379 (class 2606 OID 19535)
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- TOC entry 4381 (class 2606 OID 19533)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4076 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4050 (class 1259 OID 16750)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4051 (class 1259 OID 16752)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4052 (class 1259 OID 16753)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4109 (class 1259 OID 16831)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4142 (class 1259 OID 16939)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4097 (class 1259 OID 16919)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 4097
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4102 (class 1259 OID 16747)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4145 (class 1259 OID 16936)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4146 (class 1259 OID 16937)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4117 (class 1259 OID 16942)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4114 (class 1259 OID 16803)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4115 (class 1259 OID 16948)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4155 (class 1259 OID 17073)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 4152 (class 1259 OID 17026)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4162 (class 1259 OID 17099)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4163 (class 1259 OID 17097)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4168 (class 1259 OID 17098)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 4149 (class 1259 OID 16995)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4150 (class 1259 OID 16994)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4151 (class 1259 OID 16996)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4053 (class 1259 OID 16754)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4054 (class 1259 OID 16751)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4063 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4064 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4065 (class 1259 OID 16746)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4068 (class 1259 OID 16833)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4071 (class 1259 OID 16938)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4136 (class 1259 OID 16875)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4137 (class 1259 OID 16940)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4138 (class 1259 OID 16890)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4141 (class 1259 OID 16889)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4103 (class 1259 OID 16941)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4104 (class 1259 OID 17111)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 4107 (class 1259 OID 16832)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4128 (class 1259 OID 16857)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4131 (class 1259 OID 16856)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4126 (class 1259 OID 16842)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4127 (class 1259 OID 17004)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4116 (class 1259 OID 17001)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4108 (class 1259 OID 16830)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4055 (class 1259 OID 16910)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 4055
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4056 (class 1259 OID 16748)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4057 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4058 (class 1259 OID 16965)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4272 (class 1259 OID 23294)
-- Name: idx_attributes_unit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attributes_unit ON public.product_attributes USING btree (unit) WHERE (unit IS NOT NULL);


--
-- TOC entry 4230 (class 1259 OID 23227)
-- Name: idx_concentrations_acronym; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_concentrations_acronym ON public.concentrations USING btree (acronym) WHERE (acronym IS NOT NULL);


--
-- TOC entry 4231 (class 1259 OID 23228)
-- Name: idx_concentrations_color_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_concentrations_color_code ON public.concentrations USING btree (color_code) WHERE (color_code IS NOT NULL);


--
-- TOC entry 4418 (class 1259 OID 20854)
-- Name: idx_image_deletion_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_image_deletion_entity ON public.image_deletion_queue USING btree (entity_type, entity_id);


--
-- TOC entry 4419 (class 1259 OID 20852)
-- Name: idx_image_deletion_marked_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_image_deletion_marked_at ON public.image_deletion_queue USING btree (marked_at);


--
-- TOC entry 4420 (class 1259 OID 20853)
-- Name: idx_image_deletion_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_image_deletion_status ON public.image_deletion_queue USING btree (status);


--
-- TOC entry 4254 (class 1259 OID 19538)
-- Name: idx_order_items_tax_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tax_class ON public.order_items USING btree (tax_class_id);


--
-- TOC entry 4255 (class 1259 OID 19537)
-- Name: idx_order_items_tax_rate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tax_rate ON public.order_items USING btree (tax_rate);


--
-- TOC entry 4412 (class 1259 OID 19712)
-- Name: idx_promo_app_cat_cat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_app_cat_cat ON public.promotion_applicable_categories USING btree (category_id);


--
-- TOC entry 4413 (class 1259 OID 19711)
-- Name: idx_promo_app_cat_promo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_app_cat_promo ON public.promotion_applicable_categories USING btree (promotion_id);


--
-- TOC entry 4406 (class 1259 OID 19710)
-- Name: idx_promo_app_prod_prod; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_app_prod_prod ON public.promotion_applicable_products USING btree (product_id);


--
-- TOC entry 4407 (class 1259 OID 19709)
-- Name: idx_promo_app_prod_promo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_app_prod_promo ON public.promotion_applicable_products USING btree (promotion_id);


--
-- TOC entry 4390 (class 1259 OID 19608)
-- Name: idx_refund_items_refund; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refund_items_refund ON public.refund_items USING btree (refund_id);


--
-- TOC entry 4391 (class 1259 OID 19609)
-- Name: idx_refund_items_restocked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refund_items_restocked ON public.refund_items USING btree (restocked) WHERE (restocked = false);


--
-- TOC entry 4382 (class 1259 OID 19604)
-- Name: idx_refunds_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refunds_order ON public.refunds USING btree (order_id);


--
-- TOC entry 4383 (class 1259 OID 19607)
-- Name: idx_refunds_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refunds_payment ON public.refunds USING btree (payment_id);


--
-- TOC entry 4384 (class 1259 OID 19605)
-- Name: idx_refunds_refund_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refunds_refund_number ON public.refunds USING btree (refund_number);


--
-- TOC entry 4385 (class 1259 OID 19606)
-- Name: idx_refunds_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refunds_status ON public.refunds USING btree (status);


--
-- TOC entry 4396 (class 1259 OID 19644)
-- Name: idx_stock_reservations_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_reservations_expires ON public.stock_reservations USING btree (expires_at) WHERE ((status)::text = 'ACTIVE'::text);


--
-- TOC entry 4397 (class 1259 OID 19645)
-- Name: idx_stock_reservations_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_reservations_reference ON public.stock_reservations USING btree (reference_id, reservation_type);


--
-- TOC entry 4398 (class 1259 OID 19646)
-- Name: idx_stock_reservations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_reservations_status ON public.stock_reservations USING btree (status);


--
-- TOC entry 4399 (class 1259 OID 19643)
-- Name: idx_stock_reservations_variant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_reservations_variant ON public.stock_reservations USING btree (product_variant_id, warehouse_id);


--
-- TOC entry 4358 (class 1259 OID 22030)
-- Name: idx_users_email_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_lower ON public.users USING btree (lower((email)::text));


--
-- TOC entry 4359 (class 1259 OID 22031)
-- Name: idx_users_full_name_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_full_name_lower ON public.users USING btree (lower((full_name)::text));


--
-- TOC entry 4360 (class 1259 OID 22032)
-- Name: idx_users_phone_lower; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone_lower ON public.users USING btree (lower((phone)::text));


--
-- TOC entry 4361 (class 1259 OID 22033)
-- Name: idx_users_status_created_at_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status_created_at_desc ON public.users USING btree (status, created_at DESC);


--
-- TOC entry 4309 (class 1259 OID 17947)
-- Name: idx_variants_cached_attributes_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_variants_cached_attributes_gin ON public.product_variants USING btree (cached_attributes);


--
-- TOC entry 4171 (class 1259 OID 17294)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4175 (class 1259 OID 17295)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4174 (class 1259 OID 17196)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4079 (class 1259 OID 16560)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4082 (class 1259 OID 16582)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4188 (class 1259 OID 17487)
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4178 (class 1259 OID 17363)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4083 (class 1259 OID 17409)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4084 (class 1259 OID 17328)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4085 (class 1259 OID 17411)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4183 (class 1259 OID 17412)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4086 (class 1259 OID 16583)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4087 (class 1259 OID 17410)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 4191 (class 1259 OID 17478)
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- TOC entry 4549 (class 2620 OID 19648)
-- Name: stock_reservations trg_sync_reserved_quantity; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_reserved_quantity AFTER INSERT OR DELETE OR UPDATE ON public.stock_reservations FOR EACH ROW EXECUTE FUNCTION public.sync_reserved_quantity_to_warehouse_stock();


--
-- TOC entry 4548 (class 2620 OID 19668)
-- Name: reviews trg_update_product_stats_review; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_product_stats_review AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_product_stats_on_review();


--
-- TOC entry 4545 (class 2620 OID 17152)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 4540 (class 2620 OID 17419)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 4541 (class 2620 OID 17449)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4542 (class 2620 OID 17405)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 4543 (class 2620 OID 17448)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 4546 (class 2620 OID 17415)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 4547 (class 2620 OID 17450)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4544 (class 2620 OID 17316)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 4425 (class 2606 OID 16734)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4430 (class 2606 OID 16823)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4429 (class 2606 OID 16811)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4428 (class 2606 OID 16798)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4436 (class 2606 OID 17063)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4437 (class 2606 OID 17068)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4438 (class 2606 OID 17092)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4439 (class 2606 OID 17087)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4435 (class 2606 OID 16989)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4423 (class 2606 OID 16767)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4432 (class 2606 OID 16870)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4433 (class 2606 OID 16943)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4434 (class 2606 OID 16884)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4426 (class 2606 OID 17106)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4427 (class 2606 OID 16762)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4431 (class 2606 OID 16851)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4455 (class 2606 OID 18022)
-- Name: category_attributes fk10k0tiopwgc25cxqf2b2uavar; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT fk10k0tiopwgc25cxqf2b2uavar FOREIGN KEY (attribute_id) REFERENCES public.attribute_types(id);


--
-- TOC entry 4445 (class 2606 OID 17977)
-- Name: addresses fk1fa36y2oqhao3wgg2rw1pi459; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fk1fa36y2oqhao3wgg2rw1pi459 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4461 (class 2606 OID 18052)
-- Name: login_history fk20v0mimmdegh2afs39uixlxpm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT fk20v0mimmdegh2afs39uixlxpm FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4521 (class 2606 OID 18352)
-- Name: users fk20xg15hxgl0kpqdd06k2gkyr3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk20xg15hxgl0kpqdd06k2gkyr3 FOREIGN KEY (primary_role_id) REFERENCES public.roles(id);


--
-- TOC entry 4515 (class 2606 OID 18322)
-- Name: seo_urls fk2pxg3o152dcm3epu3c8o8s9k5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_urls
    ADD CONSTRAINT fk2pxg3o152dcm3epu3c8o8s9k5 FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4524 (class 2606 OID 18372)
-- Name: wishlists fk330pyw2el06fn5g28ypyljt16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT fk330pyw2el06fn5g28ypyljt16 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4509 (class 2606 OID 18292)
-- Name: review_images fk3aayo5bjciyemf3bvvt987hkr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT fk3aayo5bjciyemf3bvvt987hkr FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- TOC entry 4462 (class 2606 OID 18057)
-- Name: order_items fk3lqbhmejwu2ty4awish5xdpxv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk3lqbhmejwu2ty4awish5xdpxv FOREIGN KEY (gift_product_id) REFERENCES public.products(id);


--
-- TOC entry 4522 (class 2606 OID 18357)
-- Name: warehouse_stock fk3sbmirkp3dnimp3x1a4lyibrq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_stock
    ADD CONSTRAINT fk3sbmirkp3dnimp3x1a4lyibrq FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4505 (class 2606 OID 18272)
-- Name: related_products fk4th19vyip0aua7bp4gob8vr5r; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT fk4th19vyip0aua7bp4gob8vr5r FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4523 (class 2606 OID 18362)
-- Name: warehouse_stock fk4vu7c7du9op0n5bxn6kqubb02; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_stock
    ADD CONSTRAINT fk4vu7c7du9op0n5bxn6kqubb02 FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- TOC entry 4501 (class 2606 OID 18252)
-- Name: promotion_usage fk4x8sa31599c6wj1kqqclu2fnu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_usage
    ADD CONSTRAINT fk4x8sa31599c6wj1kqqclu2fnu FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4481 (class 2606 OID 18157)
-- Name: product_member_prices fk54786m0kjelexp7ogfn8jqrbv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_member_prices
    ADD CONSTRAINT fk54786m0kjelexp7ogfn8jqrbv FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4513 (class 2606 OID 18317)
-- Name: search_queries fk5aj3jwvam1xxuedadhd216w63; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT fk5aj3jwvam1xxuedadhd216w63 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4457 (class 2606 OID 18032)
-- Name: customer_lifetime_value fk6fjdu9jlsd03yt0xon5see76y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_lifetime_value
    ADD CONSTRAINT fk6fjdu9jlsd03yt0xon5see76y FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4458 (class 2606 OID 18037)
-- Name: customer_vip_history fk6y48i3hf4x8n44r5sn8mm3l70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_vip_history
    ADD CONSTRAINT fk6y48i3hf4x8n44r5sn8mm3l70 FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4471 (class 2606 OID 18117)
-- Name: product_attributes fk7aial34asbpkbq557lkb3gwg6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT fk7aial34asbpkbq557lkb3gwg6 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4479 (class 2606 OID 18147)
-- Name: product_images fk7duksvvesmxhelrq7ugqkaq8b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk7duksvvesmxhelrq7ugqkaq8b FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4469 (class 2606 OID 18092)
-- Name: payments fk81gagumt0r8y3rmudcgpbk42l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk81gagumt0r8y3rmudcgpbk42l FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4452 (class 2606 OID 18007)
-- Name: carts fk8ba3sryid5k8a9kidpkvqipyt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk8ba3sryid5k8a9kidpkvqipyt FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4516 (class 2606 OID 18327)
-- Name: stock_alerts fk9f11upd5cry4729du7vwmmb3w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_alerts
    ADD CONSTRAINT fk9f11upd5cry4729du7vwmmb3w FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4495 (class 2606 OID 18232)
-- Name: product_views fk9wal1ra5egnm0t01wworru283; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT fk9wal1ra5egnm0t01wworru283 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4498 (class 2606 OID 18237)
-- Name: products fka3a4mpsfdf4d2y6r8ra3sc8mv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fka3a4mpsfdf4d2y6r8ra3sc8mv FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- TOC entry 4486 (class 2606 OID 18177)
-- Name: product_specifications fkbets5sov4bn9d2wy8vqathw6d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT fkbets5sov4bn9d2wy8vqathw6d FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4463 (class 2606 OID 18062)
-- Name: order_items fkbioxgbv59vetrxe0ejfubep1w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4475 (class 2606 OID 18122)
-- Name: product_comparisons fkbwb7rmo5co6rc0ykyqyg9a3td; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_comparisons
    ADD CONSTRAINT fkbwb7rmo5co6rc0ykyqyg9a3td FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4502 (class 2606 OID 18257)
-- Name: promotion_usage fkbyy7k8x01fo47k89k0d1ieog1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_usage
    ADD CONSTRAINT fkbyy7k8x01fo47k89k0d1ieog1 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4496 (class 2606 OID 18227)
-- Name: product_views fkc93jen7gg3twjaatbhfrwljmk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT fkc93jen7gg3twjaatbhfrwljmk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4472 (class 2606 OID 18112)
-- Name: product_attributes fkcex46yvx4g18b2pn09p79h1mc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT fkcex46yvx4g18b2pn09p79h1mc FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4510 (class 2606 OID 18307)
-- Name: reviews fkcgy7qjc1r99dp117y9en6lxye; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkcgy7qjc1r99dp117y9en6lxye FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4448 (class 2606 OID 17987)
-- Name: attribute_options fkckwkeougyvts5ivl1a4vuom5l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_options
    ADD CONSTRAINT fkckwkeougyvts5ivl1a4vuom5l FOREIGN KEY (attribute_type_id) REFERENCES public.attribute_types(id);


--
-- TOC entry 4466 (class 2606 OID 18082)
-- Name: orders fkcppmkwca2ygehnred8mdof0ca; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fkcppmkwca2ygehnred8mdof0ca FOREIGN KEY (customer_vip_tier_id) REFERENCES public.member_pricing_tiers(id);


--
-- TOC entry 4490 (class 2606 OID 18217)
-- Name: product_variants fkd0y00ecthejy1ms738atf0365; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkd0y00ecthejy1ms738atf0365 FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4491 (class 2606 OID 18207)
-- Name: product_variants fkd148w5qww6dm8ctr8xfetnlb6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkd148w5qww6dm8ctr8xfetnlb6 FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4499 (class 2606 OID 18247)
-- Name: products fkdeswm6d74skv6do803axl6edj; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkdeswm6d74skv6do803axl6edj FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4503 (class 2606 OID 18262)
-- Name: promotion_usage fkejsynwyybbw6r6eo7w0p6sfa5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_usage
    ADD CONSTRAINT fkejsynwyybbw6r6eo7w0p6sfa5 FOREIGN KEY (promotion_id) REFERENCES public.promotions(id);


--
-- TOC entry 4477 (class 2606 OID 18132)
-- Name: product_gifts fkf0y7uhv75xh02kbfhr2qjnrtc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_gifts
    ADD CONSTRAINT fkf0y7uhv75xh02kbfhr2qjnrtc FOREIGN KEY (gift_product_id) REFERENCES public.products(id);


--
-- TOC entry 4507 (class 2606 OID 18287)
-- Name: review_helpful fkf3dwj08rqdk4n17xjh7j1k5d3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpful
    ADD CONSTRAINT fkf3dwj08rqdk4n17xjh7j1k5d3 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4459 (class 2606 OID 18042)
-- Name: customers fkgore5u1n928mfrpudwp9djh1x; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fkgore5u1n928mfrpudwp9djh1x FOREIGN KEY (current_vip_tier_id) REFERENCES public.member_pricing_tiers(id);


--
-- TOC entry 4518 (class 2606 OID 18342)
-- Name: user_roles fkh8ciramu9cc9q3qcqiv4ue8a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkh8ciramu9cc9q3qcqiv4ue8a6 FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 4519 (class 2606 OID 18347)
-- Name: user_roles fkhfh9dx7w3ubf1co1vdev94g3f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkhfh9dx7w3ubf1co1vdev94g3f FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4508 (class 2606 OID 18282)
-- Name: review_helpful fkhhoc1j28r302q8nkbs6wy93mt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpful
    ADD CONSTRAINT fkhhoc1j28r302q8nkbs6wy93mt FOREIGN KEY (review_id) REFERENCES public.reviews(id);


--
-- TOC entry 4449 (class 2606 OID 17992)
-- Name: bundle_items fkhqxny2l7rhqtqcdbeh3u33tf5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT fkhqxny2l7rhqtqcdbeh3u33tf5 FOREIGN KEY (bundle_id) REFERENCES public.product_bundles(id);


--
-- TOC entry 4446 (class 2606 OID 17972)
-- Name: addresses fkhrpf5e8dwasvdc5cticysrt2k; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT fkhrpf5e8dwasvdc5cticysrt2k FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4453 (class 2606 OID 18012)
-- Name: carts fkiifertand9wiuunh2205p38pa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fkiifertand9wiuunh2205p38pa FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4492 (class 2606 OID 18197)
-- Name: product_variants fkiw2eym147xk44aahe4pjo56is; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkiw2eym147xk44aahe4pjo56is FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4478 (class 2606 OID 18137)
-- Name: product_gifts fkja2xd03ejy7j4jyu5vbi0bnph; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_gifts
    ADD CONSTRAINT fkja2xd03ejy7j4jyu5vbi0bnph FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4447 (class 2606 OID 17982)
-- Name: attribute_option_translations fkjgj383jx1fs8uf4y616pdrbro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute_option_translations
    ADD CONSTRAINT fkjgj383jx1fs8uf4y616pdrbro FOREIGN KEY (attribute_option_id) REFERENCES public.attribute_options(id);


--
-- TOC entry 4473 (class 2606 OID 18107)
-- Name: product_attributes fkjn6cb8h4utnsw58bqb6019rub; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT fkjn6cb8h4utnsw58bqb6019rub FOREIGN KEY (attribute_option_id) REFERENCES public.attribute_options(id);


--
-- TOC entry 4450 (class 2606 OID 18002)
-- Name: bundle_items fkjrpmdfqfqh1iyc78sj0ytaf6s; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT fkjrpmdfqfqh1iyc78sj0ytaf6s FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4468 (class 2606 OID 18087)
-- Name: password_reset_tokens fkk3ndxg5xp6v7wd4gjyusp15gq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fkk3ndxg5xp6v7wd4gjyusp15gq FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4517 (class 2606 OID 18332)
-- Name: url_slugs_history fkk58bb3dq0dpqqrmjn16s2mjm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.url_slugs_history
    ADD CONSTRAINT fkk58bb3dq0dpqqrmjn16s2mjm FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 4500 (class 2606 OID 18242)
-- Name: products fkl0lce8i162ldn9n01t2a6lcix; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkl0lce8i162ldn9n01t2a6lcix FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4525 (class 2606 OID 18367)
-- Name: wishlists fkl7ao98u2bm8nijc1rv4jobcrx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT fkl7ao98u2bm8nijc1rv4jobcrx FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4506 (class 2606 OID 18277)
-- Name: related_products fkl7cgoxua2qw2tnjdwwvg7uh04; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT fkl7cgoxua2qw2tnjdwwvg7uh04 FOREIGN KEY (related_product_id) REFERENCES public.products(id);


--
-- TOC entry 4520 (class 2606 OID 18337)
-- Name: user_roles fkljgw07fam7v71ok817u4rvyro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkljgw07fam7v71ok817u4rvyro FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 4464 (class 2606 OID 18072)
-- Name: order_items fkltmtlue0wixrg1cf0xo7x0l4d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkltmtlue0wixrg1cf0xo7x0l4d FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4483 (class 2606 OID 18162)
-- Name: product_price_history fkmk25m9jk3i8puaf2sxqadcd8t; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_price_history
    ADD CONSTRAINT fkmk25m9jk3i8puaf2sxqadcd8t FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 4497 (class 2606 OID 18222)
-- Name: product_views fkmqkjak6vmswvyme6lu788cwy7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT fkmqkjak6vmswvyme6lu788cwy7 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4511 (class 2606 OID 18297)
-- Name: reviews fkmspopcwguish8794sw1elaylk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkmspopcwguish8794sw1elaylk FOREIGN KEY (moderated_by) REFERENCES public.users(id);


--
-- TOC entry 4487 (class 2606 OID 18182)
-- Name: product_translations fkn8aifokvlqtmaoriv3st4tk7x; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT fkn8aifokvlqtmaoriv3st4tk7x FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4451 (class 2606 OID 17997)
-- Name: bundle_items fknsknapfft2bfgq2ktievb8vv1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT fknsknapfft2bfgq2ktievb8vv1 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4465 (class 2606 OID 18067)
-- Name: order_items fkocimc7dtr037rh4ls4l95nlfi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkocimc7dtr037rh4ls4l95nlfi FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4488 (class 2606 OID 18187)
-- Name: product_translations fkom5nwwno2wotmalniq34w627y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT fkom5nwwno2wotmalniq34w627y FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4493 (class 2606 OID 18212)
-- Name: product_variants fkosqitn4s405cynmhb87lkvuau; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkosqitn4s405cynmhb87lkvuau FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4482 (class 2606 OID 18152)
-- Name: product_member_prices fkp0h8fnop22lssejmjc5nwqn4l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_member_prices
    ADD CONSTRAINT fkp0h8fnop22lssejmjc5nwqn4l FOREIGN KEY (pricing_tier_id) REFERENCES public.member_pricing_tiers(id);


--
-- TOC entry 4512 (class 2606 OID 18302)
-- Name: reviews fkpl51cejpw4gy5swfar8br9ngi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkpl51cejpw4gy5swfar8br9ngi FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4514 (class 2606 OID 18312)
-- Name: search_queries fkpsx7q842bsvqj2ctsfv9elf47; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT fkpsx7q842bsvqj2ctsfv9elf47 FOREIGN KEY (clicked_product_id) REFERENCES public.products(id);


--
-- TOC entry 4467 (class 2606 OID 18077)
-- Name: orders fkpxtb8awmi0dk6smoh2vp1litg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fkpxtb8awmi0dk6smoh2vp1litg FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4484 (class 2606 OID 18167)
-- Name: product_price_history fkq2nf0j0wapk6u52ei7dy91h84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_price_history
    ADD CONSTRAINT fkq2nf0j0wapk6u52ei7dy91h84 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4489 (class 2606 OID 18192)
-- Name: product_translations fkq5qr4aobsin8v8kwnlq18qf2t; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_translations
    ADD CONSTRAINT fkq5qr4aobsin8v8kwnlq18qf2t FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4480 (class 2606 OID 18142)
-- Name: product_images fkqnq71xsohugpqwf3c9gxmsuy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fkqnq71xsohugpqwf3c9gxmsuy FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4460 (class 2606 OID 18047)
-- Name: inventory_transactions fkr8ovd4msjdy3vhm6m7dlonmbo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT fkr8ovd4msjdy3vhm6m7dlonmbo FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4456 (class 2606 OID 18027)
-- Name: category_attributes fks8x8saggy3b3wx581pn813por; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT fks8x8saggy3b3wx581pn813por FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4454 (class 2606 OID 18017)
-- Name: categories fksaok720gsu4u2wrgbk10b5n8d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT fksaok720gsu4u2wrgbk10b5n8d FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- TOC entry 4485 (class 2606 OID 18172)
-- Name: product_seo_urls fksbfvhudodlrvvd1k0rp97uvn4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_seo_urls
    ADD CONSTRAINT fksbfvhudodlrvvd1k0rp97uvn4 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4476 (class 2606 OID 18127)
-- Name: product_conversion_tracking fksgn5yrl3sqqymbmdswmbj65fm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conversion_tracking
    ADD CONSTRAINT fksgn5yrl3sqqymbmdswmbj65fm FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4494 (class 2606 OID 18202)
-- Name: product_variants fkt02drnbss1gbbc05o2csnmmwc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkt02drnbss1gbbc05o2csnmmwc FOREIGN KEY (concentration_id) REFERENCES public.concentrations(id);


--
-- TOC entry 4470 (class 2606 OID 18097)
-- Name: pre_orders fkt2808o3wgbjv4yuuqaq5obw30; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_orders
    ADD CONSTRAINT fkt2808o3wgbjv4yuuqaq5obw30 FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4474 (class 2606 OID 18102)
-- Name: product_attributes fkt36l8oun7wfu3atbmdgvx5tbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT fkt36l8oun7wfu3atbmdgvx5tbd FOREIGN KEY (attribute_type_id) REFERENCES public.attribute_types(id);


--
-- TOC entry 4504 (class 2606 OID 18267)
-- Name: promotion_usage fktc1p79kdje5blf4ud9b5y298a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_usage
    ADD CONSTRAINT fktc1p79kdje5blf4ud9b5y298a FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4535 (class 2606 OID 19660)
-- Name: product_stats product_stats_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_stats
    ADD CONSTRAINT product_stats_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4538 (class 2606 OID 19704)
-- Name: promotion_applicable_categories promotion_applicable_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_categories
    ADD CONSTRAINT promotion_applicable_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4539 (class 2606 OID 19699)
-- Name: promotion_applicable_categories promotion_applicable_categories_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_categories
    ADD CONSTRAINT promotion_applicable_categories_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- TOC entry 4536 (class 2606 OID 19684)
-- Name: promotion_applicable_products promotion_applicable_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_products
    ADD CONSTRAINT promotion_applicable_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4537 (class 2606 OID 19679)
-- Name: promotion_applicable_products promotion_applicable_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_applicable_products
    ADD CONSTRAINT promotion_applicable_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- TOC entry 4529 (class 2606 OID 19589)
-- Name: refund_items refund_items_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items
    ADD CONSTRAINT refund_items_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id);


--
-- TOC entry 4530 (class 2606 OID 19594)
-- Name: refund_items refund_items_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items
    ADD CONSTRAINT refund_items_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4531 (class 2606 OID 19584)
-- Name: refund_items refund_items_refund_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items
    ADD CONSTRAINT refund_items_refund_id_fkey FOREIGN KEY (refund_id) REFERENCES public.refunds(id) ON DELETE CASCADE;


--
-- TOC entry 4532 (class 2606 OID 19599)
-- Name: refund_items refund_items_restocked_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_items
    ADD CONSTRAINT refund_items_restocked_warehouse_id_fkey FOREIGN KEY (restocked_warehouse_id) REFERENCES public.warehouses(id);


--
-- TOC entry 4526 (class 2606 OID 19558)
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4527 (class 2606 OID 19563)
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- TOC entry 4528 (class 2606 OID 19568)
-- Name: refunds refunds_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- TOC entry 4533 (class 2606 OID 19633)
-- Name: stock_reservations stock_reservations_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_reservations
    ADD CONSTRAINT stock_reservations_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id);


--
-- TOC entry 4534 (class 2606 OID 19638)
-- Name: stock_reservations stock_reservations_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_reservations
    ADD CONSTRAINT stock_reservations_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- TOC entry 4424 (class 2606 OID 16572)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4443 (class 2606 OID 17392)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4440 (class 2606 OID 17338)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4441 (class 2606 OID 17358)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4442 (class 2606 OID 17353)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4444 (class 2606 OID 17473)
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- TOC entry 4701 (class 0 OID 16525)
-- Dependencies: 271
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4715 (class 0 OID 16929)
-- Dependencies: 288
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4706 (class 0 OID 16727)
-- Dependencies: 279
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4700 (class 0 OID 16518)
-- Dependencies: 270
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4710 (class 0 OID 16816)
-- Dependencies: 283
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4709 (class 0 OID 16804)
-- Dependencies: 282
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4708 (class 0 OID 16791)
-- Dependencies: 281
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4716 (class 0 OID 16979)
-- Dependencies: 289
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4699 (class 0 OID 16507)
-- Dependencies: 269
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4713 (class 0 OID 16858)
-- Dependencies: 286
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4714 (class 0 OID 16876)
-- Dependencies: 287
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4702 (class 0 OID 16533)
-- Dependencies: 272
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4707 (class 0 OID 16757)
-- Dependencies: 280
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4712 (class 0 OID 16843)
-- Dependencies: 285
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4711 (class 0 OID 16834)
-- Dependencies: 284
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4698 (class 0 OID 16495)
-- Dependencies: 267
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4717 (class 0 OID 17279)
-- Dependencies: 299
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4703 (class 0 OID 16546)
-- Dependencies: 273
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4721 (class 0 OID 17426)
-- Dependencies: 303
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4722 (class 0 OID 17453)
-- Dependencies: 304
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4705 (class 0 OID 16588)
-- Dependencies: 275
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4704 (class 0 OID 16561)
-- Dependencies: 274
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4720 (class 0 OID 17382)
-- Dependencies: 302
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4718 (class 0 OID 17329)
-- Dependencies: 300
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4719 (class 0 OID 17343)
-- Dependencies: 301
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4723 (class 0 OID 17463)
-- Dependencies: 305
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4724 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 4727 (class 6106 OID 22022)
-- Name: supabase_realtime brands; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.brands;


--
-- TOC entry 4725 (class 6106 OID 22020)
-- Name: supabase_realtime categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.categories;


--
-- TOC entry 4726 (class 6106 OID 22021)
-- Name: supabase_realtime users; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.users;


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 34
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 23
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 18
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 13
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 35
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 29
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 490
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 486
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 487
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 458
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 488
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 462
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 464
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 455
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 454
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 463
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 465
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 466
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 459
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 494
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 442
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 441
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 443
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 485
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 481
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 483
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 480
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 482
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 484
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 475
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 476
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 478
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 471
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 473
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 472
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 474
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 467
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 468
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 470
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 495
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 496
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 450
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 451
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 452
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 453
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 444
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 445
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 447
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 446
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 448
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 510
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 428
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 440
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 553
-- Name: FUNCTION sync_reserved_quantity_to_warehouse_stock(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_reserved_quantity_to_warehouse_stock() TO anon;
GRANT ALL ON FUNCTION public.sync_reserved_quantity_to_warehouse_stock() TO authenticated;
GRANT ALL ON FUNCTION public.sync_reserved_quantity_to_warehouse_stock() TO service_role;


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 554
-- Name: FUNCTION update_product_stats_on_review(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_product_stats_on_review() TO anon;
GRANT ALL ON FUNCTION public.update_product_stats_on_review() TO authenticated;
GRANT ALL ON FUNCTION public.update_product_stats_on_review() TO service_role;


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 517
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 523
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 519
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 515
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 514
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 518
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 520
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 513
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 522
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 512
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 516
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 500
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 502
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 503
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 288
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 279
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 282
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 281
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 291
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 290
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 292
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 268
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 280
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 307
-- Name: TABLE addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.addresses TO anon;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.addresses TO service_role;


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 306
-- Name: SEQUENCE addresses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.addresses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.addresses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.addresses_id_seq TO service_role;


--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 309
-- Name: TABLE attribute_option_translations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.attribute_option_translations TO anon;
GRANT ALL ON TABLE public.attribute_option_translations TO authenticated;
GRANT ALL ON TABLE public.attribute_option_translations TO service_role;


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 308
-- Name: SEQUENCE attribute_option_translations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.attribute_option_translations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.attribute_option_translations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.attribute_option_translations_id_seq TO service_role;


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 311
-- Name: TABLE attribute_options; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.attribute_options TO anon;
GRANT ALL ON TABLE public.attribute_options TO authenticated;
GRANT ALL ON TABLE public.attribute_options TO service_role;


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 310
-- Name: SEQUENCE attribute_options_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.attribute_options_id_seq TO anon;
GRANT ALL ON SEQUENCE public.attribute_options_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.attribute_options_id_seq TO service_role;


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 313
-- Name: TABLE attribute_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.attribute_types TO anon;
GRANT ALL ON TABLE public.attribute_types TO authenticated;
GRANT ALL ON TABLE public.attribute_types TO service_role;


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 312
-- Name: SEQUENCE attribute_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.attribute_types_id_seq TO anon;
GRANT ALL ON SEQUENCE public.attribute_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.attribute_types_id_seq TO service_role;


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 315
-- Name: TABLE brands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.brands TO anon;
GRANT ALL ON TABLE public.brands TO authenticated;
GRANT ALL ON TABLE public.brands TO service_role;


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 314
-- Name: SEQUENCE brands_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.brands_id_seq TO anon;
GRANT ALL ON SEQUENCE public.brands_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.brands_id_seq TO service_role;


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 317
-- Name: TABLE bundle_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bundle_items TO anon;
GRANT ALL ON TABLE public.bundle_items TO authenticated;
GRANT ALL ON TABLE public.bundle_items TO service_role;


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 316
-- Name: SEQUENCE bundle_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bundle_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.bundle_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.bundle_items_id_seq TO service_role;


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 319
-- Name: TABLE carts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.carts TO anon;
GRANT ALL ON TABLE public.carts TO authenticated;
GRANT ALL ON TABLE public.carts TO service_role;


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 318
-- Name: SEQUENCE carts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.carts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.carts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.carts_id_seq TO service_role;


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 321
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 320
-- Name: SEQUENCE categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.categories_id_seq TO service_role;


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 323
-- Name: TABLE category_attributes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.category_attributes TO anon;
GRANT ALL ON TABLE public.category_attributes TO authenticated;
GRANT ALL ON TABLE public.category_attributes TO service_role;


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 322
-- Name: SEQUENCE category_attributes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.category_attributes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.category_attributes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.category_attributes_id_seq TO service_role;


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 325
-- Name: TABLE concentrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.concentrations TO anon;
GRANT ALL ON TABLE public.concentrations TO authenticated;
GRANT ALL ON TABLE public.concentrations TO service_role;


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 324
-- Name: SEQUENCE concentrations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.concentrations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.concentrations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.concentrations_id_seq TO service_role;


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 327
-- Name: TABLE currency_rates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.currency_rates TO anon;
GRANT ALL ON TABLE public.currency_rates TO authenticated;
GRANT ALL ON TABLE public.currency_rates TO service_role;


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 326
-- Name: SEQUENCE currency_rates_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.currency_rates_id_seq TO anon;
GRANT ALL ON SEQUENCE public.currency_rates_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.currency_rates_id_seq TO service_role;


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 329
-- Name: TABLE customer_lifetime_value; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_lifetime_value TO anon;
GRANT ALL ON TABLE public.customer_lifetime_value TO authenticated;
GRANT ALL ON TABLE public.customer_lifetime_value TO service_role;


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 328
-- Name: SEQUENCE customer_lifetime_value_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.customer_lifetime_value_id_seq TO anon;
GRANT ALL ON SEQUENCE public.customer_lifetime_value_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.customer_lifetime_value_id_seq TO service_role;


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 331
-- Name: TABLE customer_vip_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_vip_history TO anon;
GRANT ALL ON TABLE public.customer_vip_history TO authenticated;
GRANT ALL ON TABLE public.customer_vip_history TO service_role;


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 330
-- Name: SEQUENCE customer_vip_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.customer_vip_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.customer_vip_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.customer_vip_history_id_seq TO service_role;


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 333
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 332
-- Name: SEQUENCE customers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.customers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.customers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.customers_id_seq TO service_role;


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 427
-- Name: TABLE image_deletion_queue; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.image_deletion_queue TO anon;
GRANT ALL ON TABLE public.image_deletion_queue TO authenticated;
GRANT ALL ON TABLE public.image_deletion_queue TO service_role;


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 426
-- Name: SEQUENCE image_deletion_queue_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.image_deletion_queue_id_seq TO anon;
GRANT ALL ON SEQUENCE public.image_deletion_queue_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.image_deletion_queue_id_seq TO service_role;


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 335
-- Name: TABLE inventory_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_transactions TO anon;
GRANT ALL ON TABLE public.inventory_transactions TO authenticated;
GRANT ALL ON TABLE public.inventory_transactions TO service_role;


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 334
-- Name: SEQUENCE inventory_transactions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.inventory_transactions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.inventory_transactions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.inventory_transactions_id_seq TO service_role;


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 337
-- Name: TABLE login_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_history TO anon;
GRANT ALL ON TABLE public.login_history TO authenticated;
GRANT ALL ON TABLE public.login_history TO service_role;


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 336
-- Name: SEQUENCE login_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.login_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.login_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.login_history_id_seq TO service_role;


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 339
-- Name: TABLE member_pricing_tiers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_pricing_tiers TO anon;
GRANT ALL ON TABLE public.member_pricing_tiers TO authenticated;
GRANT ALL ON TABLE public.member_pricing_tiers TO service_role;


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 338
-- Name: SEQUENCE member_pricing_tiers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_pricing_tiers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_pricing_tiers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_pricing_tiers_id_seq TO service_role;


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 341
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 340
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO service_role;


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 342
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.orders_id_seq TO service_role;


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 345
-- Name: TABLE password_reset_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_reset_tokens TO anon;
GRANT ALL ON TABLE public.password_reset_tokens TO authenticated;
GRANT ALL ON TABLE public.password_reset_tokens TO service_role;


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 344
-- Name: SEQUENCE password_reset_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.password_reset_tokens_id_seq TO anon;
GRANT ALL ON SEQUENCE public.password_reset_tokens_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.password_reset_tokens_id_seq TO service_role;


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 347
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 346
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 349
-- Name: TABLE pre_orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pre_orders TO anon;
GRANT ALL ON TABLE public.pre_orders TO authenticated;
GRANT ALL ON TABLE public.pre_orders TO service_role;


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 348
-- Name: SEQUENCE pre_orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.pre_orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.pre_orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.pre_orders_id_seq TO service_role;


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE product_attributes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_attributes TO anon;
GRANT ALL ON TABLE public.product_attributes TO authenticated;
GRANT ALL ON TABLE public.product_attributes TO service_role;


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 350
-- Name: SEQUENCE product_attributes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_attributes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_attributes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_attributes_id_seq TO service_role;


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE product_bundles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_bundles TO anon;
GRANT ALL ON TABLE public.product_bundles TO authenticated;
GRANT ALL ON TABLE public.product_bundles TO service_role;


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 352
-- Name: SEQUENCE product_bundles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_bundles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_bundles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_bundles_id_seq TO service_role;


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE product_comparisons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_comparisons TO anon;
GRANT ALL ON TABLE public.product_comparisons TO authenticated;
GRANT ALL ON TABLE public.product_comparisons TO service_role;


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 354
-- Name: SEQUENCE product_comparisons_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_comparisons_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_comparisons_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_comparisons_id_seq TO service_role;


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE product_conversion_tracking; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_conversion_tracking TO anon;
GRANT ALL ON TABLE public.product_conversion_tracking TO authenticated;
GRANT ALL ON TABLE public.product_conversion_tracking TO service_role;


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 356
-- Name: SEQUENCE product_conversion_tracking_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_conversion_tracking_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_conversion_tracking_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_conversion_tracking_id_seq TO service_role;


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE product_gifts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_gifts TO anon;
GRANT ALL ON TABLE public.product_gifts TO authenticated;
GRANT ALL ON TABLE public.product_gifts TO service_role;


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 358
-- Name: SEQUENCE product_gifts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_gifts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_gifts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_gifts_id_seq TO service_role;


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE product_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 360
-- Name: SEQUENCE product_images_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO service_role;


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE product_member_prices; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_member_prices TO anon;
GRANT ALL ON TABLE public.product_member_prices TO authenticated;
GRANT ALL ON TABLE public.product_member_prices TO service_role;


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 362
-- Name: SEQUENCE product_member_prices_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_member_prices_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_member_prices_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_member_prices_id_seq TO service_role;


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE product_price_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_price_history TO anon;
GRANT ALL ON TABLE public.product_price_history TO authenticated;
GRANT ALL ON TABLE public.product_price_history TO service_role;


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 364
-- Name: SEQUENCE product_price_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_price_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_price_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_price_history_id_seq TO service_role;


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE product_seo_urls; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_seo_urls TO anon;
GRANT ALL ON TABLE public.product_seo_urls TO authenticated;
GRANT ALL ON TABLE public.product_seo_urls TO service_role;


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 366
-- Name: SEQUENCE product_seo_urls_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_seo_urls_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_seo_urls_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_seo_urls_id_seq TO service_role;


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE product_specifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_specifications TO anon;
GRANT ALL ON TABLE public.product_specifications TO authenticated;
GRANT ALL ON TABLE public.product_specifications TO service_role;


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 368
-- Name: SEQUENCE product_specifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_specifications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_specifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_specifications_id_seq TO service_role;


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 421
-- Name: TABLE product_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_stats TO anon;
GRANT ALL ON TABLE public.product_stats TO authenticated;
GRANT ALL ON TABLE public.product_stats TO service_role;


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE product_translations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_translations TO anon;
GRANT ALL ON TABLE public.product_translations TO authenticated;
GRANT ALL ON TABLE public.product_translations TO service_role;


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 370
-- Name: SEQUENCE product_translations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_translations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_translations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_translations_id_seq TO service_role;


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE product_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_variants TO anon;
GRANT ALL ON TABLE public.product_variants TO authenticated;
GRANT ALL ON TABLE public.product_variants TO service_role;


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 372
-- Name: SEQUENCE product_variants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_variants_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_variants_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_variants_id_seq TO service_role;


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 375
-- Name: TABLE product_views; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_views TO anon;
GRANT ALL ON TABLE public.product_views TO authenticated;
GRANT ALL ON TABLE public.product_views TO service_role;


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 374
-- Name: SEQUENCE product_views_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_views_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_views_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_views_id_seq TO service_role;


--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 377
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 376
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;


--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 425
-- Name: TABLE promotion_applicable_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotion_applicable_categories TO anon;
GRANT ALL ON TABLE public.promotion_applicable_categories TO authenticated;
GRANT ALL ON TABLE public.promotion_applicable_categories TO service_role;


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 424
-- Name: SEQUENCE promotion_applicable_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotion_applicable_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotion_applicable_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotion_applicable_categories_id_seq TO service_role;


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 423
-- Name: TABLE promotion_applicable_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotion_applicable_products TO anon;
GRANT ALL ON TABLE public.promotion_applicable_products TO authenticated;
GRANT ALL ON TABLE public.promotion_applicable_products TO service_role;


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 422
-- Name: SEQUENCE promotion_applicable_products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotion_applicable_products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotion_applicable_products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotion_applicable_products_id_seq TO service_role;


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 379
-- Name: TABLE promotion_usage; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotion_usage TO anon;
GRANT ALL ON TABLE public.promotion_usage TO authenticated;
GRANT ALL ON TABLE public.promotion_usage TO service_role;


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 378
-- Name: SEQUENCE promotion_usage_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotion_usage_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotion_usage_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotion_usage_id_seq TO service_role;


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 381
-- Name: TABLE promotions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotions TO anon;
GRANT ALL ON TABLE public.promotions TO authenticated;
GRANT ALL ON TABLE public.promotions TO service_role;


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 380
-- Name: SEQUENCE promotions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.promotions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.promotions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.promotions_id_seq TO service_role;


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 417
-- Name: TABLE refund_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.refund_items TO anon;
GRANT ALL ON TABLE public.refund_items TO authenticated;
GRANT ALL ON TABLE public.refund_items TO service_role;


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 416
-- Name: SEQUENCE refund_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.refund_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.refund_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.refund_items_id_seq TO service_role;


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 413
-- Name: SEQUENCE refund_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.refund_number_seq TO anon;
GRANT ALL ON SEQUENCE public.refund_number_seq TO authenticated;
GRANT ALL ON SEQUENCE public.refund_number_seq TO service_role;


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 415
-- Name: TABLE refunds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.refunds TO anon;
GRANT ALL ON TABLE public.refunds TO authenticated;
GRANT ALL ON TABLE public.refunds TO service_role;


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 414
-- Name: SEQUENCE refunds_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.refunds_id_seq TO anon;
GRANT ALL ON SEQUENCE public.refunds_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.refunds_id_seq TO service_role;


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 383
-- Name: TABLE related_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.related_products TO anon;
GRANT ALL ON TABLE public.related_products TO authenticated;
GRANT ALL ON TABLE public.related_products TO service_role;


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 382
-- Name: SEQUENCE related_products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.related_products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.related_products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.related_products_id_seq TO service_role;


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE review_helpful; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_helpful TO anon;
GRANT ALL ON TABLE public.review_helpful TO authenticated;
GRANT ALL ON TABLE public.review_helpful TO service_role;


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 384
-- Name: SEQUENCE review_helpful_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_helpful_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_helpful_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_helpful_id_seq TO service_role;


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE review_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_images TO anon;
GRANT ALL ON TABLE public.review_images TO authenticated;
GRANT ALL ON TABLE public.review_images TO service_role;


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 386
-- Name: SEQUENCE review_images_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.review_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.review_images_id_seq TO service_role;


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 388
-- Name: SEQUENCE reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO service_role;


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 390
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_id_seq TO service_role;


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE search_queries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.search_queries TO anon;
GRANT ALL ON TABLE public.search_queries TO authenticated;
GRANT ALL ON TABLE public.search_queries TO service_role;


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 392
-- Name: SEQUENCE search_queries_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.search_queries_id_seq TO anon;
GRANT ALL ON SEQUENCE public.search_queries_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.search_queries_id_seq TO service_role;


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE seo_urls; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.seo_urls TO anon;
GRANT ALL ON TABLE public.seo_urls TO authenticated;
GRANT ALL ON TABLE public.seo_urls TO service_role;


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 394
-- Name: SEQUENCE seo_urls_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.seo_urls_id_seq TO anon;
GRANT ALL ON SEQUENCE public.seo_urls_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.seo_urls_id_seq TO service_role;


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 418
-- Name: TABLE shedlock; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shedlock TO anon;
GRANT ALL ON TABLE public.shedlock TO authenticated;
GRANT ALL ON TABLE public.shedlock TO service_role;


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE stock_alerts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stock_alerts TO anon;
GRANT ALL ON TABLE public.stock_alerts TO authenticated;
GRANT ALL ON TABLE public.stock_alerts TO service_role;


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 396
-- Name: SEQUENCE stock_alerts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.stock_alerts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.stock_alerts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.stock_alerts_id_seq TO service_role;


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 420
-- Name: TABLE stock_reservations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stock_reservations TO anon;
GRANT ALL ON TABLE public.stock_reservations TO authenticated;
GRANT ALL ON TABLE public.stock_reservations TO service_role;


--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 419
-- Name: SEQUENCE stock_reservations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.stock_reservations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.stock_reservations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.stock_reservations_id_seq TO service_role;


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE tax_classes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tax_classes TO anon;
GRANT ALL ON TABLE public.tax_classes TO authenticated;
GRANT ALL ON TABLE public.tax_classes TO service_role;


--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 398
-- Name: SEQUENCE tax_classes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tax_classes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tax_classes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tax_classes_id_seq TO service_role;


--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE url_slugs_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.url_slugs_history TO anon;
GRANT ALL ON TABLE public.url_slugs_history TO authenticated;
GRANT ALL ON TABLE public.url_slugs_history TO service_role;


--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 400
-- Name: SEQUENCE url_slugs_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.url_slugs_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.url_slugs_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.url_slugs_history_id_seq TO service_role;


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 402
-- Name: SEQUENCE user_roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_roles_id_seq TO service_role;


--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 404
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE warehouse_stock; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.warehouse_stock TO anon;
GRANT ALL ON TABLE public.warehouse_stock TO authenticated;
GRANT ALL ON TABLE public.warehouse_stock TO service_role;


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 406
-- Name: SEQUENCE warehouse_stock_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.warehouse_stock_id_seq TO anon;
GRANT ALL ON SEQUENCE public.warehouse_stock_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.warehouse_stock_id_seq TO service_role;


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 409
-- Name: TABLE warehouses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.warehouses TO anon;
GRANT ALL ON TABLE public.warehouses TO authenticated;
GRANT ALL ON TABLE public.warehouses TO service_role;


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 408
-- Name: SEQUENCE warehouses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.warehouses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.warehouses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.warehouses_id_seq TO service_role;


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 411
-- Name: TABLE wishlists; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wishlists TO anon;
GRANT ALL ON TABLE public.wishlists TO authenticated;
GRANT ALL ON TABLE public.wishlists TO service_role;


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 410
-- Name: SEQUENCE wishlists_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.wishlists_id_seq TO anon;
GRANT ALL ON SEQUENCE public.wishlists_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.wishlists_id_seq TO service_role;


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 299
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 293
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 296
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 295
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 273
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 304
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 274
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 302
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 305
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 277
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2708 (class 826 OID 16603)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2709 (class 826 OID 16604)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2707 (class 826 OID 16602)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2718 (class 826 OID 16682)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2717 (class 826 OID 16681)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2716 (class 826 OID 16680)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2721 (class 826 OID 16637)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2720 (class 826 OID 16636)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2719 (class 826 OID 16635)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2713 (class 826 OID 16617)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2715 (class 826 OID 16616)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2714 (class 826 OID 16615)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2700 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2701 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2699 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2703 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2698 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2702 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2711 (class 826 OID 16607)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2712 (class 826 OID 16608)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2710 (class 826 OID 16606)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2706 (class 826 OID 16545)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2705 (class 826 OID 16544)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2704 (class 826 OID 16543)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 3889 (class 3466 OID 16621)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 3894 (class 3466 OID 16700)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 3888 (class 3466 OID 16619)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 3895 (class 3466 OID 16703)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 3890 (class 3466 OID 16622)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 3891 (class 3466 OID 16623)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2025-12-03 20:09:08

--
-- PostgreSQL database dump complete
--

\unrestrict aFxLbCtMPNh8AQady2gPLn4I1cH0ePDkjsSUCaxJBCMl2UN2bYtH2yJYr35kBn4

