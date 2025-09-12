
create or replace function get_aggregated_donors()
returns table (
    name text,
    avatar text,
    amount float,
    email text
) as $$
begin
    return query
    select
        pr.full_name as name,
        pr.avatar_url as avatar,
        sum(d.amount) as amount,
        pr.email as email
    from donations d
    join profiles pr on d.user_id = pr.id
    group by pr.id, pr.full_name, pr.avatar_url, pr.email
    order by sum(d.amount) desc;
end;
$$ language plpgsql;
