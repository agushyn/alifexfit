<?php

namespace App\Services\Tenancy;

use App\Models\Gym;

class GymContext
{
    protected ?Gym $gym = null;
    protected ?int $gymId = null;
    protected bool $bypassScope = false;
    protected bool $isSuperAdmin = false;

    public function getGym(): ?Gym
    {
        if ($this->gym === null && $this->gymId !== null) {
            $this->gym = Gym::find($this->gymId);
        }

        return $this->gym;
    }

    public function getGymId(): ?int
    {
        return $this->gymId ?? $this->gym?->id;
    }

    public function setGym(?Gym $gym): self
    {
        $this->gym = $gym;
        $this->gymId = $gym?->id;

        return $this;
    }

    public function setGymId(?int $id): self
    {
        $this->gymId = $id;
        $this->gym = null;

        return $this;
    }

    public function clear(): self
    {
        $this->gym = null;
        $this->gymId = null;
        $this->bypassScope = false;
        $this->isSuperAdmin = false;

        return $this;
    }

    public function isBypassed(): bool
    {
        return $this->bypassScope;
    }

    public function setBypass(bool $bypass): self
    {
        $this->bypassScope = $bypass;

        return $this;
    }

    public function isSuperAdmin(): bool
    {
        return $this->isSuperAdmin;
    }

    public function setIsSuperAdmin(bool $val): self
    {
        $this->isSuperAdmin = $val;

        return $this;
    }

    public function runWithoutScope(callable $callback): mixed
    {
        $original = $this->bypassScope;
        $this->bypassScope = true;

        try {
            return $callback();
        } finally {
            $this->bypassScope = $original;
        }
    }
}
