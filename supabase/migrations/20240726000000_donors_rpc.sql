create or replace function get_aggregated_donors()
returns table(name text, avatar text, amount numeric, email text)
language plpgsql
security definer
as $$
begin
  return query
  select
    coalesce(pr.full_name, 'Anonymous') as name,
    pr.avatar_url as avatar,
    sum(d.amount) as amount,
    pr.email as email
  from donations as d
  left join profiles as pr on d.user_id = pr.id
  group by d.user_id, pr.full_name, pr.avatar_url, pr.email
  order by sum(d.amount) desc;
end;
$$;

grant execute on function get_aggregated_donors() to anon;
grant execute on function get_aggregated_donors() to authenticated;
