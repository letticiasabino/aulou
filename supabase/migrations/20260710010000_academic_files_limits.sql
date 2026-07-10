-- Sprint 5: limites de upload reforcados no banco e no bucket privado.
alter table public.files
  add constraint files_size_bytes_max check (size_bytes <= 10485760),
  add constraint files_content_type_allowed check (
    content_type in (
      'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'
    )
  );

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'
    ]::text[]
where id = 'academic-files';
