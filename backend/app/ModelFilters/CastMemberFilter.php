<?php 

namespace App\ModelFilters;

class CastMemberFilter  extends DefaultModelFilter
{
    protected $sortable = ['name', 'type','active', 'created_at'];

    public function search($search){
        $this->where('name', 'LIKE', "%$search%");
    }
}
