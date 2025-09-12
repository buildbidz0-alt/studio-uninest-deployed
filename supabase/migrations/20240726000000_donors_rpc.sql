create or replace function get_aggregated_donors()
returns table (
    name text,
    avatar text,
    amount numeric,
    email text
)
language sql
security definer
as $$
    select
        pr.full_name as name,
        pr.avatar_url as avatar,
        sum(d.amount) as amount,
        pr.email as email
    from donations as d
    join profiles as pr on d.user_id = pr.id
    group by pr.full_name, pr.avatar_url, pr.email
    order by sum(d.amount) desc;
$$;

grant execute on function get_aggregated_donors() to anon;
