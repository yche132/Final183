# These are the controllers for your ajax api.


def get_user_name_from_email(email):
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])


def get_posts():

    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0

    posts = []
    has_more = False
    rows = db().select(db.post.ALL, orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))

    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            username = get_user_name_from_email(r.user_email)
            if auth.user:
                upost = True if auth.user.email == r.user_email else False
            else:
                upost = False

            po = dict(
                id=r.id,
                username=username,
                upost=upost,
                post_edit=False,
                created_on=r.created_on,
                updated_on=r.updated_on,
                user_email = r.user_email,
                post_content = r.post_content
            )
            posts.append(po)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(
        posts=posts,
        has_more=has_more,
        logged_in=logged_in
    ))


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():

    po_id = db.post.insert(
        post_content=request.vars.post_content
    )

    po = db.post(po_id)
    username = get_user_name_from_email(po.user_email)
    if auth.user:
        upost = True if auth.user.email == po.user_email else False
    else:
        upost = False
        upost = False

    post = dict(
        id=po.id,
        username=username,
        upost=upost,
        created_on=po.created_on,
        updated_on=po.updated_on,
        user_email=po.user_email,
        post_content=po.post_content
    )

    return response.json(dict(post=post))


@auth.requires_signature()
def del_post():
    if (auth.user.email == request.vars.user_email):
        db(db.post.id == request.vars.post_id).delete()
        isDeleted = True
    else:
        session.flash = T('Not Authorized')
        isDeleted = False
    return response.json(dict(isDeleted=isDeleted))


@auth.requires_signature()
def update_post():
    post_id = request.vars.post_id
    post_content = request.vars.new_post_content

    db(db.post.id == post_id).update(
        post_content=post_content,
        updated_on=datetime.datetime.utcnow())

    post = db(db.post.id == post_id).select().first()

    return response.json(dict(
        post_id=post.id,
        post_content=post.post_content,
        updated_on=post.updated_on
    ))
