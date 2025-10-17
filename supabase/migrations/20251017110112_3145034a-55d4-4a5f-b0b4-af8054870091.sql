-- Phase 2: Delete duplicate/placeholder image-only entries from 10/16/2025
DELETE FROM avatar_library 
WHERE id IN (
  '14f068d4-9ac5-46c1-a85d-d6ebd891536e',
  '029d84b2-c031-40bd-bcfe-53096113f18c'
);