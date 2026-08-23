<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRolesAndPermissions
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withPivot('gym_id')
            ->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user');
    }

    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return $this->roles->contains(function (Role $role) use ($roles) {
            return in_array($role->name, $roles, true);
        });
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        // Direct permission check
        if ($this->permissions->contains('name', $permission)) {
            return true;
        }

        // Role-based permission check
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('name', $permission)) {
                return true;
            }
        }

        return false;
    }

    public function assignRole(Role|string $role, ?int $gymId = null): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $gymId = $gymId ?? $this->gym_id;

        if (!$this->roles()->where('roles.id', $role->id)->wherePivot('gym_id', $gymId)->exists()) {
            $this->roles()->attach($role->id, ['gym_id' => $gymId]);
            $this->load('roles.permissions');
        }

        return $this;
    }

    public function removeRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
        $this->load('roles.permissions');

        return $this;
    }

    public function givePermission(Permission|string $permission): self
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->permissions()->where('permissions.id', $permission->id)->exists()) {
            $this->permissions()->attach($permission->id);
            $this->load('permissions');
        }

        return $this;
    }

    public function revokePermission(Permission|string $permission): self
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission->id);
        $this->load('permissions');

        return $this;
    }

    public function getRoleNamesAttribute(): array
    {
        return $this->roles->pluck('name')->toArray();
    }

    public function getPermissionNamesAttribute(): array
    {
        if ($this->isSuperAdmin()) {
            return Permission::pluck('name')->toArray();
        }

        $direct = $this->permissions->pluck('name');
        $fromRoles = $this->roles->flatMap(fn (Role $r) => $r->permissions->pluck('name'));

        return $direct->merge($fromRoles)->unique()->values()->toArray();
    }
}
