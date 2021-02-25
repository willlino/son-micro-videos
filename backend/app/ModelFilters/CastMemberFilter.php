<?php 

namespace App\ModelFilters;

use App\Models\CastMember;

class CastMemberFilter  extends DefaultModelFilter
{
    protected $sortable = ['name', 'type','active', 'created_at'];

    public function search($search){
        $this->where('name', 'LIKE', "%$search%");
    }

    public function type($type){
        $type_ = (int)$type;
        if(in_array($type_, CastMember::$types)){
            $this->orWhere('type', (int)$type);
        }
    }
}
