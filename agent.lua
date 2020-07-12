local resty_md5 = require "resty.md5"
local cjson = require "cjson"
local resty_string = require "resty.string"

local _M  = {}
_M.cache = {}

-- TABLE FUNCTIONS
function _M.shuffleTable(self, t)
    local rand = math.random
    assert( t, "shuffleTable() expected a table, got nil" )
    local iterations = #t
    local j

    for i = iterations, 2, -1 do
        j = rand(i)
        t[i], t[j] = t[j], t[i]
    end
end
function _M.mergeTables(self, t1, t2)
    for i=1,#t2 do
        t1[#t1+1] = t2[i]
    end
    return t1
end
function _M.sliceTable(self, t, first, last)
  local sub = {}
  for i=first,last do
    sub[#sub + 1] = t[i]
  end
  return sub
end
function _M.inTable ( self, e, t )
    for _,v in pairs(t) do
    if (v==e) then return true end
    end
    return false
end
-- AGENT FUNCTIONS
function _M.getUID(self)
    math.randomseed( os.time() )
    -- check if uid cookie set
    local uid
    if ngx.var.cookie_uid == nil or ngx.var.cookie_uid == '' then
        local md5 = resty_md5:new()
        -- calc uid
        local real_ip = ngx.var.remote_addr
        if ngx.var.http_x_forwarded_for ~= nil and ngx.var.http_x_forwarded_for ~= ngx.null then
            real_ip = ngx.var.http_x_forwarded_for
        end
        local headers = ngx.req.get_headers()
        local ua = headers["User-Agent"]
        if ua == nil then
            ua = ''
        end
        if ua[0] then ua = ua[0] end
        md5:update(real_ip .. ua .. math.random())
        uid = resty_string.to_hex(md5:final())
        ngx.header['Set-Cookie'] = 'uid=' .. uid .. '; path=/; expires=' .. ngx.cookie_time(ngx.time() + 86400*365)
    else
        uid = ngx.var.cookie_uid
    end

    return uid
end

function _M.getGEO(self, GLOBAL_GEO)
    local geo = "ALL"
    if ngx.var.http_cf_ipcountry ~= nil then
        if GLOBAL_GEO[ngx.var.http_cf_ipcountry] ~= nil then
            geo = GLOBAL_GEO[ngx.var.http_cf_ipcountry]
        end
    else
        if GLOBAL_GEO[ngx.var.geoip_country_code] ~= nil then
            geo = GLOBAL_GEO[ngx.var.geoip_country_code]
        end
    end

    return geo
end

function _M.loadTeasers(self, red, uid, geo, domain, category, sort, cn, rn)
    local cout = {}
    local rout = {}
    local gcout = {}
    local grout = {}
    local out = {}
    local r = false
    local c
    local chash
    local th
    local vh
    local tdata
    local md5 = resty_md5:new()
    local tkey

    if sort == 'ctr' then
        tkey = "cache:" .. geo
    else
        tkey = "cache:latest"
    end
    if _M.cache[tkey] == nil then
	tdata = red:get(tkey)
	if tdata == ngx.null or tdata == nil then
	    tdata = red:get("cache:ALL")
	end
	if tdata == ngx.null or tdata == nil then
    	    _M.cache[tkey] = nil
	else
	    _M.cache[tkey] = cjson.decode(tdata)
	end
    end
    
    for tpos,teaser in pairs(_M.cache[tkey]) do
        if #cout >= cn*2 and #rout >= rn*2 then
            break
        end
        th = red:exists("users:" .. uid .. ":clicks:" .. teaser.hash)
        if tonumber(th) == 0 then
            vh = red:exists("users:" .. uid .. ":visit:" .. teaser.domain)
        end
        c = true
        if _M.excepts[teaser.hash] ~= nil then
    	    c = false
        end
        if c and category ~= nil then
            -- check category
            if type(category) == 'table' then
                if not _M:inTable(teaser.category, category) then
                    c = false
                end
            else
                if teaser.category ~= category then
                    c = false
                end
            end
        end
        if c and teaser.url ~= '' then
            if teaser.domain == domain then
                -- recycling
                if #rout >= rn*2 then
                    c = false
                end
                r = true
            else
                -- not recycling
                if #cout >= cn*2 then
                    c = false
                end
                r = false
            end
            if c then
                chash = ''
                if tonumber(th) == 0 and tonumber(vh) == 0 then
                    -- not clicked yet
                    if r == false and teaser.url:match('^%w+://([^/]+)') ~= domain then
                        md5:update(uid .. teaser.hash .. _M.GLOBAL_HASH_SECRET)
                        -- generate click hash
                        chash = resty_string.to_hex(md5:final())
                        -- save click hash
                        red:setex("secure:" .. chash, _M.GLOBAL_HASH_TTL, "")
                    end

                    if r then
                        table.insert(rout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/go/' .. teaser.hash .. '/', img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                    else
                        if chash == '' then
                            table.insert(cout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/go/' .. teaser.hash .. '/', img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                        else
                            table.insert(cout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/click/' .. teaser.hash .. '/' .. chash, img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                        end
                    end
                else
                    if r then
                        if #grout < rn*2 then
                            table.insert(grout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/go/' .. teaser.hash .. '/', img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                        end
                    else
                        if #gcout < cn*2 then
                            if teaser.url:match('^%w+://([^/]+)') == rdomain then
                                table.insert(gcout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/go/' .. teaser.hash .. '/', img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                            else
                                table.insert(gcout, {id = teaser.hash, title = teaser.title, url = _M.GLOBAL_AGENT_URL .. '/click/' .. teaser.hash .. '/', img = _M.GLOBAL_STATIC_URL .. '/' .. teaser.hash .. '/big'})
                            end
                        end
                    end
                end
            end
        end
    end

    -- check if array is empty
    if #cout == 0 and #gcout ~= 0 then
        cout = gcout
    end
    if #rout == 0 and #grout ~= 0 then
        rout = grout
    end
    -- shuffle rout
    if #rout > 0 then
        _M:shuffleTable(rout)
        -- slice
        rout = _M.sliceTable(rout, 0, rn)
    end
    -- shuffle cout
    if #cout > 0 then
        _M:shuffleTable(cout)
        if #rout < rn then
            cn = cn + rn - #rout
        end
        -- slice
        cout = _M:sliceTable(cout, 0, cn)
    end
    -- MERGE AND SHUFFLE
    out = _M:mergeTables(cout, rout)
    for tpos, teaser in pairs(out) do
	_M.excepts[teaser.id] = 1
    end

    _M:shuffleTable(out)
    return out
end

return _M