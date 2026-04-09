DO $$
DECLARE
  v_editor_role uuid;
  v_member_role uuid;
  v_editor_policy uuid;
  v_member_policy uuid;
  v_temp_policy uuid;
BEGIN
  -- Clean up temporary exploration policy.
  SELECT id INTO v_temp_policy
  FROM directus_policies
  WHERE name = 'Temp Policy'
  LIMIT 1;

  IF v_temp_policy IS NOT NULL THEN
    DELETE FROM directus_policies WHERE id = v_temp_policy;
  END IF;

  -- Ensure roles.
  SELECT id INTO v_editor_role
  FROM directus_roles
  WHERE name = 'Editor'
  LIMIT 1;

  IF v_editor_role IS NULL THEN
    INSERT INTO directus_roles (id, name, icon, description, parent)
    VALUES (
      gen_random_uuid(),
      'Editor',
      'edit_note',
      'Can manage content items but cannot manage users or system settings.',
      NULL
    )
    RETURNING id INTO v_editor_role;
  END IF;

  SELECT id INTO v_member_role
  FROM directus_roles
  WHERE name = 'Member'
  LIMIT 1;

  IF v_member_role IS NULL THEN
    INSERT INTO directus_roles (id, name, icon, description, parent)
    VALUES (
      gen_random_uuid(),
      'Member',
      'person',
      'Can only read published content in the active publish window.',
      NULL
    )
    RETURNING id INTO v_member_role;
  END IF;

  -- Ensure policies.
  SELECT id INTO v_editor_policy
  FROM directus_policies
  WHERE name = 'Editor Content Policy'
  LIMIT 1;

  IF v_editor_policy IS NULL THEN
    INSERT INTO directus_policies (
      id,
      name,
      icon,
      description,
      ip_access,
      enforce_tfa,
      admin_access,
      app_access
    ) VALUES (
      gen_random_uuid(),
      'Editor Content Policy',
      'edit',
      'Content write policy for editors.',
      NULL,
      false,
      false,
      true
    )
    RETURNING id INTO v_editor_policy;
  ELSE
    UPDATE directus_policies
    SET
      icon = 'edit',
      description = 'Content write policy for editors.',
      admin_access = false,
      app_access = true
    WHERE id = v_editor_policy;
  END IF;

  SELECT id INTO v_member_policy
  FROM directus_policies
  WHERE name = 'Member Read Policy'
  LIMIT 1;

  IF v_member_policy IS NULL THEN
    INSERT INTO directus_policies (
      id,
      name,
      icon,
      description,
      ip_access,
      enforce_tfa,
      admin_access,
      app_access
    ) VALUES (
      gen_random_uuid(),
      'Member Read Policy',
      'visibility',
      'Frontend read policy for members.',
      NULL,
      false,
      false,
      false
    )
    RETURNING id INTO v_member_policy;
  ELSE
    UPDATE directus_policies
    SET
      icon = 'visibility',
      description = 'Frontend read policy for members.',
      admin_access = false,
      app_access = false
    WHERE id = v_member_policy;
  END IF;

  -- Re-bind role -> policy links.
  DELETE FROM directus_access
  WHERE role IN (v_editor_role, v_member_role)
    AND "user" IS NULL;

  INSERT INTO directus_access (id, role, "user", policy, sort)
  VALUES (gen_random_uuid(), v_editor_role, NULL, v_editor_policy, 1);

  INSERT INTO directus_access (id, role, "user", policy, sort)
  VALUES (gen_random_uuid(), v_member_role, NULL, v_member_policy, 1);
END;
$$;

DO $$
DECLARE
  v_editor_policy uuid;
  v_member_policy uuid;
  v_visible_filter json;
BEGIN
  SELECT id INTO v_editor_policy
  FROM directus_policies
  WHERE name = 'Editor Content Policy'
  LIMIT 1;

  SELECT id INTO v_member_policy
  FROM directus_policies
  WHERE name = 'Member Read Policy'
  LIMIT 1;

  DELETE FROM directus_permissions
  WHERE policy IN (v_editor_policy, v_member_policy);

  -- Editor permissions: content write access, no user/system management.
  INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
  VALUES
    ('sources', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('sources', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('sources', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('sources', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('packages', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('packages', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('packages', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('packages', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('processed_assets', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('processed_assets', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('processed_assets', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('processed_assets', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('package_sources', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_sources', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_sources', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_sources', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('package_topics', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_topics', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_topics', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_topics', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('package_collections', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_collections', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_collections', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('package_collections', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),

    ('topics', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('curated_collections', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('member_tiers', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_files', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_files', 'create', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_files', 'update', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_files', 'delete', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_folders', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy),
    ('directus_presets', 'read', '{}'::json, NULL, NULL, '*', v_editor_policy);

  -- Member permissions: read only published content in active window.
  v_visible_filter := json_build_object(
    '_and', json_build_array(
      json_build_object('workflow_state', json_build_object('_eq', 'published')),
      json_build_object('publish_start_at', json_build_object('_nnull', true)),
      json_build_object('publish_start_at', json_build_object('_lte', '$NOW')),
      json_build_object(
        '_or',
        json_build_array(
          json_build_object('publish_end_at', json_build_object('_null', true)),
          json_build_object('publish_end_at', json_build_object('_gte', '$NOW'))
        )
      )
    )
  );

  INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
  VALUES
    ('packages', 'read', v_visible_filter, NULL, NULL, '*', v_member_policy),
    (
      'processed_assets',
      'read',
      json_build_object('package_id', v_visible_filter),
      NULL,
      NULL,
      '*',
      v_member_policy
    ),
    (
      'package_sources',
      'read',
      json_build_object('package_id', v_visible_filter),
      NULL,
      NULL,
      '*',
      v_member_policy
    ),
    (
      'package_topics',
      'read',
      json_build_object('package_id', v_visible_filter),
      NULL,
      NULL,
      '*',
      v_member_policy
    ),
    (
      'package_collections',
      'read',
      json_build_object('package_id', v_visible_filter),
      NULL,
      NULL,
      '*',
      v_member_policy
    ),
    ('topics', 'read', json_build_object('status', json_build_object('_eq', 'active')), NULL, NULL, '*', v_member_policy),
    ('curated_collections', 'read', json_build_object('status', json_build_object('_eq', 'active')), NULL, NULL, '*', v_member_policy),
    ('member_tiers', 'read', json_build_object('status', json_build_object('_eq', 'active')), NULL, NULL, '*', v_member_policy);
END;
$$;
