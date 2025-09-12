
create or replace function get_aggregated_donors()
returns table (
  name text,
  avatar text,
  amount numeric,
  email text
) as $$
begin
  return query
    select
      p.full_name as name,
      p.avatar_url as avatar,
      sum(d.amount) as amount,
      p.email as email
    from
      donations d
    join
      profiles p on d.user_id = p.id
    group by
      p.id, p.full_name, p.avatar_url, p.email
    order by
      sum(d.amount) desc;
end;
$$ language plpgsql;
